const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const groups = mongoCollections.groups;

const createPastSession = async(sessionDate, sessionMembers, moviePicked) => {
    let parsedMovieId;
    try {
        parsedMovieId = ObjectId(moviePicked);
    } catch(e) {
        throw new Error ("Could not create group: Invalid ID")
    }

    const groupCollection = await groups();   
    let newSession = {
        sessionDate,
        sessionMembers,
        moviePicked: parsedMovieId
    };

    const insertInfo = await groupCollection.insertOne(newSession);   
    if (insertInfo.insertedCount === 0) throw new Error ('Failed to update past session database');
    const newId = insertInfo.insertedId;
    let stringId = newId.toString(); 
    const session = await groupCollection.findOne({ _id: stringId});
    return session;
};

module.exports = {createPastSession};
