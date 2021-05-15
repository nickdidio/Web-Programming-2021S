const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const groups = mongoCollections.groups;
const usersCollection = mongoCollections.users;
const pastSessions = require("./pastSessions");
const users = require("./users");
const utils = require("../utils");


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
            filters: [],
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

    // TODO: test filter
    // else if (typeof(filter) != typeof([])) {
    //     throw new Error(`Filter must be of type list`);
    // }

    const groupCollection = await groups();   
    const userCollection = await usersCollection();

    let decisionGroup = await getGroupById(parsedGroupId);
    if (!decisionGroup) {
        throw new Error(`No group had id of ${id}`);
    }

    let sessionMembers = decisionGroup.groupMembers;
    let movieList = [];

    //Get combination of all users lists
    for (let userId of sessionMembers) {
        let parsedId = ObjectId(userId);
        let user =  users.getUserById(parsedId); 
        let userMovies = user.userMovieList; 
        for (let movie of userMovies) {
            movieList += {movie: movie, votes: 0};
        }
        
    }

    //TODO: Apply filters
    for (let movie of movieList) {
        //Genre
        //Runtime
        //MPAA Rating
        //Previously watched
    }

    //TODO: FILTER past sessions films
    
    let newSession = {
        sessionDate: new Date().getTime(), //Time since epoch
        sessionMembers: [decisionGroup.groupLeaderId],
        voteCountNeeded,
        movieList: [],
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
    console.log(group)
    for (let item of group.currentSession.movieList) {
        console.log(item)
        if (item.movie.toString() == movieId.toString()) {
            item.votes++;

            //If vote count reached
            if (item.votes == group.currentSession.voteCountNeeded) {
                pastSessions.createPastSession(groupId, group.currentSession, item.movie);
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
    else if (!filters.isArray()) {
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

module.exports = {createGroup, addGroupMember, getGroupById, deleteGroup, createSession, addVote, updateSession};
