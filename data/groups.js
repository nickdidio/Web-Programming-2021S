const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const groups = mongoCollections.groups;


const createGroup = async(groupLeaderId) => {
    let parsedLeaderId;
    try {
        parsedLeaderId = ObjectId(groupLeaderId);
    } catch(e) {
        throw new Error ("Could not create group: Invalid ID")
    }

    const groupCollection = await groups();   
    let newGroup = {
        groupMembers: [parsedLeaderId], //includes group leader
        groupMovieList: [],
        pastSessions: [],
        groupLeaderId: parsedLeaderId,
    };

    const insertInfo = await groupCollection.insertOne(newGroup);   
    if (insertInfo.insertedCount === 0) throw new Error ('Failed to update database');
    const newId = insertInfo.insertedId;
    let stringId = newId.toString(); 
    const group = await groupCollection.findOne({ _id: stringId});
    return group;
};


const addGroupMember = async (groupId, userId) => {
    let parsedGroupId;
    let parsedUserId;
    try {
        parsedGroupId = ObjectId(groupId);
        parsedUserId = ObjectId(userId);
    } catch(e) {
        throw new Error ("Could not create group: Invalid ID for user or group")
    }
    const groupCollection = await groups();
    const oldGroup = await groupCollection.findOne({ _id: parsedGroupId});
    let updatedGroup = {
        groupMembers: oldGroup.groupMembers + parsedUserId,
        groupMovieList: oldGroup.groupMovieList,
        pastSessions: oldGroup.pastSession,
        groupLeader: oldGroup.groupLeader,
    }

    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: updatedGroup});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not add group member');

    return await groupCollection.findOne({ _id: parsedGroupId});
};

//Only needs to be called before users begin to select for decision night. Gets movies from users and adds them together
const updateMovieList = async (groupId) => {
    let parsedGroupId;
    try {
        parsedGroupId = ObjectId(groupId);
    } catch(e) {
        throw new Error ("Could not create group: Invalid ID for group")
    }

    const groupCollection = await groups();
    const group = await groupCollection.findOne({ _id: parsedGroupId});
    let members = group.groupMembers;
    let newList = [];
    for (let i = 0; i < members; i++) {
        newList.concat(members[i].watchList) //check varialbe for user watchlist
    }

    // TODO Filter past sessions newList.filter(movie => !arr2.includes(movie));
    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: {groupMovieList: newList}});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not update watchlist');

    return await groupCollection.findOne({ _id: parsedGroupId});
};

const addPastSession = async (groupId, session) => {
    let parsedGroupId;
    try {
        parsedGroupId = ObjectId(groupId);
    } catch(e) {
        throw new Error ("Could not create group: Invalid ID for group")
    }

    const groupCollection = await groups();
    const oldGroup = await groupCollection.findOne({ _id: parsedGroupId});
    let updatedGroup = {
        groupMembers: oldGroup.groupMembers,
        groupMovieList: oldGroup.groupMovieList,
        pastSessions: oldGroup.pastSession + session,
        groupLeader: oldGroup.groupLeader,
    }

    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: updatedGroup});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not add past Session to group history');

    return await groupCollection.findOne({ _id: parsedGroupId});

};

module.exports = {createGroup, addGroupMember, updateMovieList, addPastSession};
