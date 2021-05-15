const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const groups = mongoCollections.groups;
const usersCollection = mongoCollections.users;
const pastSessions = require("./pastSessions");
const users = require("./users");
const utils = require("../utils");
const movies = require('./movies');
const { getUserById } = require("./users");



const createGroup = async(groupLeaderId, groupName) => {
    let parsedLeaderId;
    try {
        parsedLeaderId = ObjectId(groupLeaderId);
    } catch(e) {
        throw new Error ("Could not create group: Invalid ID")
    }
    if (typeof(groupName) != 'string') {
        throw new Error ("Could not create group: Name must be a string")
    }

    groupName = groupName.trim();
    const groupCollection = await groups();   
    let newGroup = {
        groupName,
        groupMembers: [parsedLeaderId], //includes group leader
        currentSession: {
            sessionDate: new Date().getTime(),
            sessionMembers: [parsedLeaderId],
            voteCountNeeded: 1,
            movieList: [],
            filters: {genres: [], runtime: 0, mpaa: 0},
            chosen: 'na',
            active: false
        }, 
        pastSessions: [],
        groupLeaderId: parsedLeaderId,
    };

    const insertInfo = await groupCollection.insertOne(newGroup);   
    if (insertInfo.insertedCount === 0) throw new Error ('Failed to create ');
    const newId = insertInfo.insertedId;
    let stringId = newId.toString(); 
    const group = await getGroupById(stringId);

    let leader = await users.getUserById(parsedLeaderId);
    leader.userGroups.push(stringId);
    users.updateUser(parsedLeaderId, leader);
    return group;
};


const addGroupMember = async (groupId, userId) => {
    let parsedGroupId;
    let parsedUserId;
    try {
        parsedGroupId = await utils.checkId(groupId);
        parsedUserId = await utils.checkId(userId);
    } catch(e) {
        throw new Error ("Could not add to group: Invalid ID for user or group")
    }
    const groupCollection = await groups();
    let group = await getGroupById(groupId);
    if (!group) {
        throw new Error ("Could not add member, group does not exist")
    }
    //Check if user already in group
    for (let member of group.groupMembers) {
        if (member == userId) {
            throw new Error ("User already in group");
        }
    }
    group.groupMembers.push(userId);
    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: group});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not add group member');
    //Update user's groups
    let user = await users.getUserById(parsedUserId);
    user.userGroups.push(groupId);
    users.updateUser(parsedUserId, user);

    return getGroupById(groupId);
};


const getGroupById = async (groupId) => {
    let parsedGroupId;
    try {
        parsedGroupId = ObjectId(groupId);
    } catch(e) {
        throw new Error ("Could not get group: Invalid ID for group")
    }
    const groupCollection = await groups();
    return groupCollection.findOne({ _id: parsedGroupId});
};

const deleteGroup = async (groupId) => {
    let parsedGroupId;
    try {
        parsedGroupId = ObjectId(groupId);
    } catch(e) {
        throw new Error ("Could not delete group: Invalid ID for group")
    }
    const groupCollection = await groups();

    const deleted = await groupCollection.findOneAndDelete({_id: parsedGroupId,});
      if (deleted.value === null) {
        throw new Error(`Could not delete movie with id of ${id}`);
      }
      return { groupId: parsedGroupId, deleted: true };
};

//Takes in a groupid, and the leader's votecount and filters
//sets appropriate variables in group.currentsession
const createSession = async(groupId, voteCountNeeded, filters) => {
    let parsedGroupId;
    try {
        parsedGroupId = utils.checkId(groupId);
    } catch(e) {
        throw new Error ("Could not create session: Invalid group ID")
    }
    if (typeof(voteCountNeeded) != 'number' || voteCountNeeded < 1) {
        throw new Error(`voteCount must be positive integer greater than 0`);
    }


    const groupCollection = await groups();   
    const userCollection = await usersCollection();

    let decisionGroup = await getGroupById(parsedGroupId);
    if (!decisionGroup) {
        throw new Error(`No group had id of ${id}`);
    }

    let sessionMembers = decisionGroup.groupMembers;
    let movieList = [];

    //Adds leader's movies to movieList
    movieList = updateWatchList(groupId, movieList, decisionGroup.groupLeaderId.toString())


    if (voteCountNeeded > decisionGroup.groupMembers.length) {
        throw new Error('vote count must be less than current total of group members')
    }
    let newSession = {
        sessionDate: new Date().getTime(), //Time since epoch
        sessionMembers: [decisionGroup.groupLeaderId],
        voteCountNeeded,
        movieList: movieList,
        filters,
        chosen: "na",
        active: true
    };

    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: {currentSession: newSession}});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not create new session');
    return await groupCollection.getGroupById(parsedGroupId);
};

//adds a vote to movieId, returns if vote decides outcome
const addVote = async(groupId, movieId) => {
    let group = await getGroupById(groupId);
    for (let item of group.currentSession.movieList) {
        if (item.movie.toString() == movieId.toString()) {
            item.votes++;

            //If vote count reached
            if (item.votes == group.currentSession.voteCountNeeded) {
                await pastSessions.createPastSession(groupId, group.currentSession, item.movie);
                //TODO: set active to false
                return {movieId, winner: true}
            }
        }
    }
    let parsedGroupId = ObjectId(groupId)
    const groupCollection = await groups();   
    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: group});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not add vote');
    return {movieId, winner: false}
}

const updateSession = async(groupId, {sessionDate, sessionMembers, voteCountNeeded, movieList, filters, chosen, active}) => {
    let parsedGroupId;
    try {
        parsedGroupId = utils.checkId(groupId)
    } catch(e) {
        throw new Error ("Could not update session: Invalid ID");
    }
    const groupCollection = await groups();   
    let updatedSession = {
        sessionDate,
        sessionMembers,
        voteCountNeeded,
        movieList,
        filters,
        chosen,
        active
    }
    // if (!validSession(updatedSession)) {
    //     throw new Error ("Could not update session, as the fields are invalid")
    // }
    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: {currentSession: updatedSession}});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not update session');
    return true;

    
}

//checks that all fields in a supplied session are valid
const validSession = ({sessionDate, sessionMembers, voteCountNeeded, movieList, filters, chosen, active}) => {
    if (!sessionDate) {
        throw new Error ("Could not update session, as sessionDate is invalid")
    }
    else if (!sessionMembers.isArray()) {
        throw new Error ("Could not update session, as sessionMembers is invalid")
    }
    else if (typeof(voteCountNeeded) != 'number') {
        throw new Error ("Could not update session, as voteCount is invalid")
    }
    else if (!movieList.isArray()) {
        throw new Error ("Could not update session, as movieList is invalid")
    }
    else if (typeof(filters) != 'object') {
        throw new Error ("Could not update session, as filters is invalid")
    }
    else if (typeof(chosen) != string) {
        throw new Error ("Could not update session, as chosen is invalid")
    }
    else if (typeof(active) != 'boolean') {
        throw new Error ("Could not update session, as active is invalid")
    }
    return true;
}

//gets users watchlist, runs it through current session filter, both returns and modifies watchList
const updateWatchList = async(groupId, watchList, userId) => {
    let parsedUserId;
    let parsedGroupId
    try {
        parsedUserId = utils.checkId(userId);
        parsedGroupId = utils.checkId(groupId);
    } catch(e) {
        throw new Error ("Invalid user or group ID")
    }
    if (!Array.isArray(watchList)){
        throw new Error ("Watchlist must be of type list")
    }
    let user;
    let group;
    try {
        group = await getGroupById(groupId);
        user = await getUserById(parsedUserId);
    } catch (e) {
        throw new Error ("UserId or GroupId not found!")
    }
    
    let filter = group.currentSession.filters
    let userList = user.watchList
    let ps = group.pastSessions
    let previousMovies = []

    //Gets movies from pat sessions
    for (let session of ps) {
        previousMovies.push(session.moviePicked)
    }

    //Doesnt add movie if already watched by group or if its already in the watch list
    for (let movieId of userList) {
        if(!previousMovies.includes(movieId) && !watchList.includes(movieId)){
            if (applyFilters(filter, movieId)) {
                watchList.push(movieId);
            } 
        }
    }
    return watchList;
}

//returns true or false if movie pases filters
const applyFilters = async(filters, movieId) => {
    let parsedMovieId;
    let movie
    try {
        parsedMovieId = utils.checkId(movieId);
        movie = await movies.getMovieById(movieId)
    } catch (e) {
        throw new Error ("Invalid movie id")
    }
    if (!movie) {
        throw new Error ("No movie exists with that ID")
    }

    if (filters.genres.length > 0) {
        //if theres no overlap between provided genres and genres return false
        let intersection = (filters.genres.filter(x => movie.genre.includes(x)))
        if (intersection.length === 0) {
            return false;
        }
    }
    if (filters.runtime) {
        if (filters.runtime > movie.runtime) {
            return false;
        }
    }
    if (filters.mpaa){
        //Compare rating to max rating 
        if (movie.mpaaRating == 'NR' || movie.mpaaRating == 'Not Rated'){
            console.log("1")
            return false;
        }
        if (filters.mpaa == 'G' && movie.mpaaRating != 'G') {
            console.log("2")
            return false
        }
        if (filters.mpaa == 'PG' && (movie.mpaaRating != 'G' && movie.mpaaRating != 'PG')) {
            console.log("3")
            return false
        }
        if (filters.mpaa == 'PG-13' && (movie.mpaaRating != 'G' && movie.mpaaRating != 'PG' && movie.mpaaRating != 'PG-13')) {
            console.log("4")
            return false
        }
        if (filters.mpaa == 'R' && (movie.mpaaRating != 'G' && movie.mpaaRating != 'PG' && movie.mpaaRating != 'PG-13' && movie.mpaaRating != 'R')) {
            console.log("5")
            return false
        }
        if (filters.mpaa == 'NC-17' && (movie.mpaaRating != 'G' && movie.mpaaRating != 'PG' && movie.mpaaRating != 'PG-13' && movie.mpaaRating != 'R' && movie.mpaaRating != 'NC-17')) {
            console.log("6")
            return false
        }

    }
    return true
}

module.exports = {createGroup, addGroupMember, getGroupById, deleteGroup, createSession, addVote, updateSession, updateWatchList, applyFilters};
