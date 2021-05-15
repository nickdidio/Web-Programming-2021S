const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const groups = mongoCollections.groups;
const users = mongoCollections.users;
const movies = mongoCollections.movies;
const bcrypt = require("bcrypt");
const utils = require("../utils");


function checkUserParams(email, firstName, lastName, username, password){
  const strArgs = [email, firstName, lastName, username, password];
  const strArgNames = ["email", "first name", "last name", "username", "password"];

  strArgs.forEach((arg, idx) => {
    if (!arg || typeof arg !== "string" || arg.trim() === "") {
      throw new Error(
        `Must provide a non-null, non-empty value of type 'string' for ${strArgNames[idx]}.`
      );
    }
  });
}

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
    const parsedUserId = utils.checkId(id);
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: parsedUserId });
    if (!user) throw "User not found";
    return user;
  },

  // Add User
  async addUser(email, firstName, lastName, username, password) {
    utils.checkUserParameters(email, firstName, lastName, username, password);

    const userCollection = await users();
    checkUserParams(email, firstName, lastName, username, password);
    let newUser = {
      _id: ObjectId(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      username: username.trim(),
      password: await bcrypt.hashSync(password, 16),
      userGroups: [],
      watchedMovieList: [],
      watchList: [],
    };

    const newInsertInformation = await userCollection.insertOne(newUser);
    if (newInsertInformation.insertedCount === 0) throw "Insert failed!";
    return await this.getUserById(newInsertInformation.insertedId.toString());
  },

  //Update a User
  async updateUser(id, updatedUser) {
    const parsedUserId = utils.checkId(id);
    const {email, firstName, lastName, username, password} = updatedUser;
    checkUserParams(email,firstName,lastName,username,password);
    const user = await this.getUserById(id);

    let userUpdateInfo = {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      username: updatedUser.username,
      userGroups: updatedUser.userGroups,
      watchedMovieList: updatedUser.watchedMovieList,
      watchList: updatedUser.watchList,
    };

    const userCollection = await users();
    const updateInfo = await userCollection.updateOne(
      { _id: parsedUserId },
      { $set: userUpdateInfo }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw "Update failed";

    return await this.getUserById(id);
  },

  // Add Review to User
  async addReviewToUser(userId, reviewId, reviewTitle) {
    const parsedUserId = utils.checkId(userId);
    const parsedReviewId = utils.checkId(reviewId);
    let currentUser = await this.getUserById(userId);
    if(!reviewTitle || typeof reviewTitle !== "string") throw "review title must exist and be of type string";

    const userCollection = await users();
    const updateInfo = await userCollection.updateOne(
      { _id: parsedUserId },
      { $addToSet: { reviews: { id: parsedReviewId, title: reviewTitle } } }
    );

    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw "Update failed";

    return await this.getUserById(userId);
  },

  // Remoview Review from User
  async removeReviewFromUser(userId, reviewId) {
    let currentUser = await this.getUserById(userId);
    const parsedUserId = utils.checkId(userId);
    const parsedReviewId = utils.checkId(reviewId);

    const userCollection = await users();
    const updateInfo = await userCollection.updateOne(
      { _id: parsedUserId },
      { $pull: { reviews: { id: parsedReviewId } } }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw "Update failed";

    return await this.getUserById(userId);
  },

  // See if the movie is already in the user's watchList
  async checkIfInWatchList(userId, movieId) {
    utils.checkId(userId);
    utils.checkId(movieId);
    const userCollection = await users();
    const found = await userCollection.findOne({
      watchList: movieId,
      _id: userId,
    });
    if (found) {
      return true;
    }
    return false;
  },

  // Add a user's watchList movie to the database
  async addToWatchList(userId, movieId) {
    const parsedUserId = utils.checkId(userId);
    utils.checkId(movieId);
    const userCollection = await users();
    if (await this.checkIfInWatchList(userId, movieId)) {
      return false;
    }
    const updateInfo = await userCollection.updateOne(
      { _id: parsedUserId },
      { $push: { watchList: movieId } }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw "Update failed";
    return true;
  },

  // Remove a user's watchList movie from their database
  async removeFromWatchList(userId, movieId) {
    const parsedUserId = utils.checkId(userId);
    utils.checkId(movieId);
    const userCollection = await users();
    if (!(await this.checkIfInWatchList(userId, movieId))) return false;
    const updateInfo = await userCollection.updateOne(
      { _id: parsedUserId },
      { $pull: { watchList: movieId } }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
      throw "Update failed";
    return true;
  },

  // Get a user's watchList
  async getWatchList(userId) {
    utils.checkId(userId);
    const user = await this.getUserById(userId);
    return user.watchList;
  },

  async getWatchedList(userId) {
    utils.checkId(userId);
    const user = await this.getUserById(userId);
    return user.watchedMovieList;
  },
};

module.exports = exportedMethods;
