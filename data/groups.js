const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const groups = mongoCollections.groups;
const usersCollection = mongoCollections.users;
const pastSessions = require("./pastSessions");
const users = require("./users");
const utils = require("../utils");
const movies = require('./movies');
const { getUserById, addToWatchList } = require("./users");



const createGroup = async(groupLeaderId, groupName) => {
    let parsedLeaderId = utils.checkId(groupLeaderId);
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
        groupLeaderId: parsedLeaderId
    };

    const insertInfo = await groupCollection.insertOne(newGroup);   
    if (insertInfo.insertedCount === 0) throw new Error ('Failed to create ');
    const newId = insertInfo.insertedId;
    let stringId = newId.toString(); 
    const group = await getGroupById(stringId);

    let leader = await users.getUserById(groupLeaderId);
    leader.userGroups.push(stringId);
    await users.updateUser(groupLeaderId, leader);
    return group;
};


const addGroupMember = async (groupId, userId) => {
    let parsedGroupId= utils.checkId(groupId);
    let parsedUserId= utils.checkId(userId);
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
    let user = await users.getUserById(""+parsedUserId);
    user.userGroups.push(groupId);
    await users.updateUser(userId, user);

    return getGroupById(groupId);
};


const getGroupById = async (groupId) => {
    let parsedGroupId = utils.checkId(groupId);
    const groupCollection = await groups();
    return groupCollection.findOne({ _id: parsedGroupId});
};

const deleteGroup = async (groupId) => {
    let parsedGroupId;
    try {
        parsedGroupId = utils.checkId(groupId);
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
    let parsedGroupId= utils.checkId(groupId);
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
    console.log("Session owner: " + decisionGroup.groupLeaderId)
    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: {currentSession: newSession}});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not create new session');
    return await groupCollection.getGroupById(parsedGroupId);
};

//adds a vote to movieId, returns if vote decides outcome
const addVote = async(groupId, movieId) => {
    utils.checkId(groupId);
    utils.checkId(movieId)
    let group = await getGroupById(groupId);
    for (let item of group.currentSession.movieList) {
        if (item.movie.toString() == movieId.toString()) {
            item.votes++;

            //If vote count reached
            if (item.votes == group.currentSession.voteCountNeeded) {
                await pastSessions.createPastSession(groupId, group.currentSession, item.movie);
                //TODO: set active to false
                await setMovieToWatched(group.currentSession.sessionMembers, movieId);
                return {movieId, winner: true}
            } else {
                console.log(item.votes + " " + group.currentSession.voteCountNeeded)
            }
        }
    }
    let parsedGroupId = utils.checkId(groupId)
    const groupCollection = await groups();   
    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: group});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not add vote');
    return {movieId, winner: false}
}

const updateSession = async(groupId, {sessionDate, sessionMembers, voteCountNeeded, movieList, filters, chosen, active}) => {
    let parsedGroupId = utils.checkId(groupId);
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
    let parsedUserId = utils.checkId(userId);
    utils.checkId(groupId);
    if (!Array.isArray(watchList)){
        throw new Error ("Watchlist must be of type list")
    }
    let user;
    let group;
    try {
        group = await getGroupById(groupId);
        user = await getUserById(""+parsedUserId);
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
    utils.checkId(movieId);
    let movie = await movies.getMovieById(movieId)
    if (!movie) {
        throw new Error ("No movie exists with that ID")
    }
    if (typeof(filters) != 'object') {
        throw new Error ("Invalid filters")
    }
    if (filters.genres) {
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
        if (movie.mpaaRating == 'NR'){
            return false;
        }
    }
    return true
}
const setMovieToWatched = async(sessionMembers, movieId) => {   
    for (member of sessionMembers) {
        user = ''
        try {
            user = await users.getUserById(""+member);
        } catch(e) {
            //console.log("idiot")
            console.log(e)
            return
        }
        //adds to watched
        let watchListIndex = user.watchedMovieList.indexOf(movieId);
        if (watchListIndex == -1) {
            user.watchedMovieList.push(movieId)
        }
        //removes from want to watch
        let index = user.watchList.indexOf(movieId);
        if (index > -1) {
            user.watchList.splice(index, 1)
        }
        console.log(user)
        await users.updateUser(""+member, user)
    }
    return true; //returns true if successful
}

module.exports = {createGroup, addGroupMember, getGroupById, deleteGroup, createSession, addVote, updateSession, updateWatchList, applyFilters, setMovieToWatched};
