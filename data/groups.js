const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const groups = mongoCollections.groups;
const usersCollection = mongoCollections.users;
const pastSessions = mongoCollections.pastSessions;
const users = require("./users");
const utils = require("../utils");
const { updateUser } = require("./users");

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
        groupMembers: [groupLeaderId], //includes group leader
        currentSession: {
            sessionDate: new Date().getTime(),
            sessionMembers: [groupLeaderId],
            voteCountNeeded: 1,
            movieList: [],
            filters: []
        }, 
        pastSessions: [],
        groupLeaderId: groupLeaderId,
    };

    const insertInfo = await groupCollection.insertOne(newGroup);   
    if (insertInfo.insertedCount === 0) throw new Error ('Failed to create ');
    const newId = insertInfo.insertedId;
    let stringId = newId.toString(); 
    const group = await getGroupById(stringId);

    let leader = await users.getUserById(parsedLeaderId);
    leader.userGroups.push(stringId);
    console.log(leader)
    users.updateUser(parsedLeaderId, leader);
    return group;
};


const addGroupMember = async (groupId, userId) => {
    let parsedGroupId;
    let parsedUserId;
    try {
        parsedGroupId = utils.checkId(groupId);
        parsedUserId = utils.checkId(userId)
    } catch(e) {
        throw new Error ("Could not add to group: Invalid ID for user or group")
    }
    let parsed
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

//Past Session will contain only important information about previous sessions, making it smaller than currentSession
//Separating Current Session from Past Session allows us to cut down on unnesecary data which can be discarded after the session is finished.
const createSession = async(groupId, voteCountNeeded, filters) => {
    let parsedGroupId;
    try {
        parsedGroupId = ObjectId(groupId);
    } catch(e) {
        throw new Error ("Could not create session: Invalid group ID")
    }
    const groupCollection = await groups();   
    const userCollection = await users();
    let decisionGroup = getGroupById(parsedGroupId);
    let sessionMembers = decisionGroup.groupMembers;
    let movieList = [];

    //Get combination of all users lists
    for (let userId of sessionMembers) {
        let parsedId = ObjectId(userId);
        let user =  await userCollection.findOne({ _id: parsedId}); //replace with getUserById probbly for easier error handling
        let userMovies = user.userMovieList; 
        for (movie of userMovies) {
            movieList += {movie, votes: 0};
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
        sessionMembers: groupMembers,
        voteCountNeeded,
        movieList: [],
        filters
    };

    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: {currentSession: newSession}});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not create new session');
    return await groupCollection.getGroupById(parsedGroupId);
};

//adds a vote to movieId, returns if vote decides outcome
const addVote = async(groupId, movieId) => {
    let group = getGroupById(groupId);
    for (let item of group.currentSession.movieList) {
        if (item.movie == movieId) {
            item.votes++;

            //If vote count reached
            if (item.votes == group.currentSession.voteCountNeeded) {
                pastSessions.createPastSession(groupId, group.currentSession, item.movie);
                //TODO: possibly empty the currentSession value
                return {movieId, winner: true}
            }
        }
    }
    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: group});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not add vote');
    return {movieId, winner: false}
}


module.exports = {createGroup, addGroupMember, getGroupById, deleteGroup, createSession, addVote};
