/*
 * The functions below are used across at least two different files in the data directory
 */
const { ObjectId } = require("mongodb");
const xss = require("xss");
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();
const apiKey = process.env.API_KEY;

// Checks if a given string is a valid MongoDB object id
// returns the strings as a MongoDB object id
const checkId = (id) => {
  if (id === null || typeof id !== "string" || id.trim() === "") {
    throw new Error(
      "'id' parameter must contain a non-empty value of type 'string'."
    );
  }

  const parsedId = ObjectId(id);

  return parsedId;
};

// Checks if a given string is a valid date string
// Date must be in YYYY-MM-DD format
// returns true if valid false otherwise
const isValidDateString = (date) => {
  // split string based on '-' into an array
  const dateArr = date.split("-");

  // if dateArr is not length 3, then it is not in YYYY-MM-DD format
  if (dateArr.length !== 3) {
    return false;
  }

  // convert string values in dateArr into numbers
  for (let i = 0; i < 3; i++) {
    dateArr[i] = Number(dateArr[i]);
  }

  // check if each value was succesfully converted into a positive integer
  if (dateArr.some((d) => !Number.isInteger(d) || d < 1)) {
    return false;
  }

  // list of days per month (-1 place holder at 0 index to allow indexing to match month number)
  const daysPerMonth = [-1, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // declare variables to hold year, month, and day values passed
  let [year, month, day] = dateArr;

  // check that month is less than 12
  if (month > 12) {
    return false;
  }

  // check if month is February and whether the given year is a leap year
  if (month === 2 && year % 4 === 0) {
    if (day > 29) {
      return false;
    }
  }

  // check that the day is at most equal to the number of days in the month
  if (daysPerMonth[month] < day) {
    return false;
  }

  return true;
};

// Error checks movie object parameters
const checkMovieParameters = (
  title,
  desc,
  img,
  releaseYear,
  runtime,
  mpaaRating,
  genre,
  TMDbId
) => {
  // Error check string values of movie object
  const strArgs = [title, desc, img, mpaaRating];
  const strArgNames = ["title", "description", "image source", "MPAA rating"];

  strArgs.forEach((arg, idx) => {
    if (typeof arg !== "string" || arg.trim() === "") {
      throw new Error(
        `Must provide a non-null, non-empty value of type 'string' for ${strArgNames[idx]}.`
      );
    }
  });

  // Check that MPAA is a valid rating within the set below
  const validMPAAs = new Set([
    "G",
    "PG",
    "PG-13",
    "R",
    "NC-17",
    "Not Rated",
    "NR",
  ]);

  if (!validMPAAs.has(mpaaRating)) {
    throw new Error(
      "Must provide a valid MPAA rating of G, PG, PG-13, R, or NC-17"
    );
  }

  // Check that genre array is non-empty and contains only string values
  if (!Array.isArray(genre) || genre.length === 0) {
    throw new Error(
      "Must provide a non-null, non-empty array for 'genre' parameter."
    );
  }
  if (genre.some((g) => typeof g !== "string" || g.trim() === "")) {
    throw new Error("Must provide an array of strings for genre parameter");
  }

  // Check that release year is a valid string in YYYY/MM/DD format
  if (
    typeof releaseYear !== "string" ||
    releaseYear.trim() === "" ||
    !isValidDateString(releaseYear)
  ) {
    throw new Error(
      "Must provide a string in 'YYYY/MM/DD' format as movie's release date parameter."
    );
  }

  if (typeof runtime !== "number" || isNaN(runtime) || runtime < 1) {
    throw new Error(
      "Must provide a positive, integer value for the runtime parameter."
    );
  }

  if (typeof TMDbId !== "number" || isNaN(TMDbId) || TMDbId < 1) {
    throw new Error(
      "Must provide a positive, integer value for the TMDbId parameter."
    );
  }
};

const checkReviewParameters = (reviewDate, reviewText, rating, username) => {
  if (
    typeof reviewDate !== "string" ||
    reviewDate.trim() === "" ||
    !isValidDateString(reviewDate)
  ) {
    throw new Error(
      "Must provide a string in 'YYYY/MM/DD' format as 'reviewDate' parameter."
    );
  }

  if (typeof reviewText !== "string" || reviewText.trim() === "") {
    throw new Error(
      "Must provide a non-null, non-empty value of type 'string' for reviewText parameter."
    );
  }

  if (typeof rating !== "number" || isNaN(rating) || rating > 5 || rating < 1) {
    throw new Error(
      "Must provide a real number value for rating parameter that is between 1 and 5 (inclusive)."
    );
  }

  if (typeof username !== "string" || username.trim() === "") {
    throw new Error(
      "Must provide a non-null, non-empty value of type 'string' for username parameter."
    );
  }
};

const emailValidator = (email) => {
  let emailFormat =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return emailFormat.test(email);
};

const checkUserParameters = (
  email,
  firstName,
  lastName,
  username,
  password,
  userGroups,
  watchedMovieList,
  watchList
) => {
  // Error check string values of user object
  const strArgs = [email, firstName, lastName, username, password];
  const strArgNames = [
    "email",
    "first name",
    "lastname",
    "username",
    "password",
  ];

  strArgs.forEach((arg, idx) => {
    if (typeof arg !== "string" || arg.trim() === "") {
      throw new Error(
        `Must provide a non-null, non-empty value of type 'string' for ${strArgNames[idx]}.`
      );
    }
  });

  if (!emailValidator(email)) {
    throw new Error("You must enter a valid email.");
  }

  if (userGroups) {
    if (!Array.isArray(userGroups)) {
      throw new Error(
        "Must provide a non-null, non-empty array for 'userGroups' parameter."
      );
    } else if (
      userGroup.some((g) => typeof g !== "string" || g.trim() === "")
    ) {
      throw new Error(
        "Must provide an array of strings for userGroups parameter"
      );
    }
  }

  if (watchedMovieList) {
    if (!Array.isArray(watchedMovieList)) {
      throw new Error(
        "Must provide a non-null, non-empty array for 'watchedMovieList' parameter."
      );
    } else if (
      watchedMovieList.some((g) => typeof g !== "string" || g.trim() === "")
    ) {
      throw new Error(
        "Must provide an array of strings for watchedMovieList parameter"
      );
    }
  }

  if (watchList) {
    if (!Array.isArray(watchList)) {
      throw new Error(
        "Must provide a non-null, non-empty array for 'watchList' parameter."
      );
    } else if (
      watchList.some((g) => typeof g !== "string" || g.trim() === "")
    ) {
      throw new Error(
        "Must provide an array of strings for watchList parameter"
      );
    }
  }
};

// redirect argument --- where users should be redirected to after posting a review
// most likely the page that the review button was on
const editMovieForViews = (m, redirect) => {
  m.alt = m.img.includes("../public")
    ? "Poster Unvailable for "
    : "Poster for " + m.title;

  m.reviewsRoute = `/reviews/${m._id}`;

  m.userAvgRating = m.userAvgRating
    ? m.userAvgRating.toFixed(1)
    : "No ratings have been made yet";

  m.redirect = redirect;
};

module.exports = {
  checkId,
  isValidDateString,
  checkMovieParameters,
  checkReviewParameters,
  checkUserParameters,
  emailValidator,
  editMovieForViews,
};
