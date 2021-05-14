const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const pastSessions = mongoCollections.pastSessions;
const groups = mongoCollections.groups;

//Past Session will contain only important information about previous sessions, making it smaller than currentSession
//Separating Current Session from Past Session allows us to cut down on unnesecary data which can be discarded after the session is finished.
//Takes in groupId, {currentSession}, moviePicked 
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
    const updateInfo = await groupCollection.updateOne({_id: parsedId}, {$set: group});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not add past session to group history');
};

const getPastSessionById = async(sessionId) => {
    let parsedSessionId;
    try {
        parsedSessionId = ObjectId(sessionId);
    } catch(e) {
        throw new Error ("Could not get group: Invalid ID for group")
    }
    const psCollection = await pastSessions();
    return psCollection.findOne({ _id: parsedSessionId});;
}
module.exports = {createPastSession, getPastSessionById};
