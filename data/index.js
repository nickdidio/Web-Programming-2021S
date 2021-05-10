const userData = require("./users");
const groupData = require("./groups");
const pastSessionsData = require("./pastSessions");
const movieData = require("./movies");
const reviewData = require("./reviews");

module.exports = {
  users: userData,
  groups: groupData,
  pastSessions: pastSessionsData,
  movies: movieData,
  reviews: reviewData,
};
