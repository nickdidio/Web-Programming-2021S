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
        currentSession: {
            sessionDate = new Date().getTime(), //Time since epoch
            sessionMembers: groupMembers,
            voteCountNeeded: 1,
            movieList: [],
            filters: [],
            votes: []
        }, //TODO: check if i need to initialize this to something else, gonna just initalize it to a mostly empty object which can be modified later
        pastSessions: [],
        groupLeaderId: parsedLeaderId,
    };

    const insertInfo = await groupCollection.insertOne(newGroup);   
    if (insertInfo.insertedCount === 0) throw new Error ('Failed to create ');
    const newId = insertInfo.insertedId;
    let stringId = newId.toString(); 
    const group = await getGroupById(stringId);
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
    const oldGroup = await getGroupById(parsedGroupId);
    let updatedGroup = {
        groupMembers: oldGroup.groupMembers.push(parsedUserId), 
        currentSession: oldGroup.currentSession,
        pastSessions: oldGroup.pastSessions,
        groupLeaderId: oldGroup.parsedLeaderId,
    }

    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: updatedGroup});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not add group member');

    return await groupCollection.findOne({ _id: parsedGroupId});
};

//Only needs to be called before users begin to select for decision night. Gets movies from users and adds them together
//TODO: finish implementation of movielist in curresnt session then delete this functon
// const updateMovieList = async (groupId) => {
//     let parsedGroupId;
//     try {
//         parsedGroupId = ObjectId(groupId);
//     } catch(e) {
//         throw new Error ("Could not create group: Invalid ID for group")
//     }

//     const groupCollection = await groups();
//     const group = await groupCollection.findOne({ _id: parsedGroupId});
//     let members = group.groupMembers;
//     let newList = [];
//     for (let i = 0; i < members; i++) {
//         newList.concat(members[i].watchList) //check varialbe for user watchlist
//     }

//     // TODO Filter past sessions newList.filter(movie => !arr2.includes(movie));
//     const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: {groupMovieList: newList}});
//     if (updateInfo.modifiedCount === 0) throw new Error ('Could not update watchlist');

//     return await groupCollection.findOne({ _id: parsedGroupId});
// };


const getGroupById = async (groupId) => {
    let parsedGroupId;
    try {
        parsedGroupId = ObjectId(groupId);
    } catch(e) {
        throw new Error ("Could not get group: Invalid ID for group")
    }
    const groupCollection = await groups();
    return await groupCollection.findOne({ _id: parsedGroupId});;
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
        movieList += userMovies;
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
        sessionDate = new Date().getTime(), //Time since epoch
        sessionMembers: groupMembers,
        voteCountNeeded,
        movieList: [],
        filters,
        votes: new Array(groupMembers.length).fill(0) //Array where nth item on array corresponds to vote for nth item in moveList
    };

    const updateInfo = await groupCollection.updateOne({_id: parsedGroupId}, {$set: {currentSession: newSession}});
    if (updateInfo.modifiedCount === 0) throw new Error ('Could not create new session');

    return await groupCollection.getGroupById(parsedGroupId);
};



module.exports = {createGroup, addGroupMember, getGroupById, deleteGroup, createSession/*, addVote, checkWinner*/};
