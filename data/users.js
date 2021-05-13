const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const groups = mongoCollections.groups;
const users = mongoCollections.users;
const movies = mongoCollections.movies;
const bcrypt = require("bcrypt");
const utils = require("../utils")


let exportedMethods = {
  // Get all users
  async getAllUsers() {
    const userCollection = await users();
    const userList = await userCollection.find({}).toArray();
    if (!userList) throw "No users in system!";
    return userList;
  },

  // Get User By ID
  async getUserById(id) {
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: id });
    if (!user) throw "User not found";
    return user;
  },

  // Add User
  async addUser(email, firstName, lastName, username, password) {
    const userCollection = await users();

    let newUser = {
      _id: ObjectId(),
      firstName: firstName,
      lastName: lastName,
      email: email,
      username: username,
      password: await bcrypt.hashSync(password, 16),
      userGroups: [],
      watchedMovieList: [],
      watchList: [],
    };

    const newInsertInformation = await userCollection.insertOne(newUser);
    if (newInsertInformation.insertedCount === 0) throw "Insert failed!";
    return await this.getUserById(newInsertInformation.insertedId);
  },

  //Update a User
  async updateUser(id, updatedUser) {
    const user = await this.getUserById(id);
    console.log(user);

    let userUpdateInfo = {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
    };

    const userCollection = await users();
    const updateInfo = await userCollection.updateOne(
      { _id: id },
      { $set: userUpdateInfo }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw "Update failed";

    return await this.getUserById(id);
  },

  /* // Add Review to User
  async addReviewToUser(userId, reviewId, reviewTitle) {
    let currentUser = await this.getUserById(userId);
    console.log(currentUser);

    const userCollection = await users();
    const updateInfo = await userCollection.updateOne(
      { _id: userId },
      { $addToSet: { reviews: { id: reviewId, title: reviewTitle } } }
    );

    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw "Update failed";

    return await this.getUserById(userId);
  },

  // Remoview Review from User
  async removereviewFromUser(userId, reviewId) {
    let currentUser = await this.getUserById(userId);
    console.log(currentUser);

    const userCollection = await users();
    const updateInfo = await userCollection.updateOne(
      { _id: userId },
      { $pull: { reviews: { id: reviewId } } }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw "Update failed";

    return await this.getUserById(userId);
  },


  // See if the movie is already in the user's watchList
  async checkIfInWatchList(userId, movieId) {
    const parsedUserId = utils.checkId(userId);
    const parsedMovieId = utils.checkId(movieId);
    const userCollection = await users;
    if(userCollection.find({ "watchList": { $all: [parsedMovieId]}}, {"_id": parsedUserId})) return true;
    return false;
  },

  // Add a user's watchList movie to the database
  async addToWatchList(userId, movieId) {
    const parsedUserId = utils.checkId(userId);
    const parsedMovieId = utils.checkId(movieId);
    const userCollection = await users;
    if(checkIfInWatchList(userId,movieId)) return false;
    const updateInfo = await userCollection.updateOne(
      { _id: parsedUserId },
      { $push: {watchList: parsedMovieId} }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw "Update failed";
    return true;
  },


  // Remove a user's watchList movie from their database
  async removeFromWatchList(userId, movieId) {
    const parsedUserId = utils.checkId(userId);
    const parsedMovieId = utils.checkId(movieId);
    const userCollection = await users;
    if(!checkIfInWatchList(userId,movieId)) return false;
    const updateInfo = await userCollection.updateOne(
      { _id: parsedUserId },
      { $pull: {watchList: parsedMovieId} }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw "Update failed";
    return true;
  },

  // Get a user's watchList
  async getWatchList(userId){
    const parsedUserId = utils.checkId(userId);
    const user = this.getUserById(paresdUserId);
    return user.watchList;
  },
};

module.exports = exportedMethods;
