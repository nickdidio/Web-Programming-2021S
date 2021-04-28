const userData = require("./users");
const groupData = require("./groups"); // includes functions for pass sessions sub-document
const movieData = require("./movies"); // includes functions for reviews sub-document

module.exports = {
  users: userData,
  groups: groupData,
  movies: movieData,
};
