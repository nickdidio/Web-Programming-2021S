const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const pastSessions = mongoCollections.pastSessions;
const groups = mongoCollections.groups;
const utils = require('../utils')

//Past Session storees select information from the current session and sets active to false
const createPastSession = async(groupId, {sessionDate, sessionMembers, voteCountNeeded, movieList, filters}, moviePicked) => {
    let parsedMovieId;
    let parsedGroupId
    try {
        parsedMovieId = ObjectId(moviePicked);
        parsedGroupId = ObjectId(groupId);
    } catch(e) {
        throw new Error ("Could not create group: Invalid ID")
    }

    const psCollection = await pastSessions();   
    let newSession = {
        parsedGroupId,
        sessionDate,
        sessionMembers,
        moviePicked: parsedMovieId
    };

    const insertInfo = await psCollection.insertOne(newSession);   
    if (insertInfo.insertedCount === 0) throw new Error ('Failed to update past session database');

    const groupCollection = await groups();
    const group = await groupCollection.findOne({ _id: parsedGroupId});
    group.pastSessions.push(newSession);
    group.currentSession.active = false;
    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: group});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not add past session to group history');
};

const getPastSessionById = async(sessionId) => {
    let parsedSessionId;
    try {
        parsedSessionId = utils.checkId(sessionId);
    } catch(e) {
        throw new Error ("Could not get group: Invalid ID for group")
    }
    const psCollection = await pastSessions();
    return psCollection.findOne({ _id: parsedSessionId});;
}
module.exports = {createPastSession, getPastSessionById};
