/*
 * The functions below are used across at least two different files in the data directory
 */

const { ObjectId } = require("mongodb");

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

module.exports = {
  checkId,
  isValidDateString,
};
