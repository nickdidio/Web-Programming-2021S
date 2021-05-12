const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const movies = mongoCollections.movies;
const utils = require("../utils");

/*
 * NOTE: ALL 'id' FIELDS TO FUNCTIONS ARE EXPECTED TO BE STRINGS
 */

// function to check review parameters

const createReview = async (
  reviewDate,
  reviewText,
  rating,
  username,
  movieId
) => {
  const parsedMovieId = utils.checkId(movieId);

  utils.checkReviewParameters(reviewDate, reviewText, rating, username);

  let newReview = {
    _id: ObjectId(),
    reviewDate,
    reviewText,
    rating,
    username,
    movieId: parsedMovieId,
  };

  const movieCollection = await movies();

  const updated = await movieCollection.updateOne({ _id: parsedMovieId }, [
    { $set: { reviews: { $concatArrays: ["$reviews", [newReview]] } } },
    { $set: { userAvgRating: { $avg: "$reviews.rating" } } },
  ]);

  if (updated === null) {
    throw new Error(
      `Cannot create review because movie collection does not contain a movie with an id value of ${movieId}.`
    );
  }

  return await getReviewById(newReview._id.toString());
};

const getReviewById = async (id) => {
  const parsedId = utils.checkId(id);

  const movieCollection = await movies();

  const movie = await movieCollection.findOne({
    "reviews._id": { $eq: parsedId },
  });

  if (movie === null) {
    throw new Error("A review with the given id value does not exist.");
  }

  const review = movie.reviews.find((r) => r._id.toString() === id);
  review._id = review._id.toString();

  return review;
};

const getMovieReviews = async (movieId) => {
  const parsedMovieId = utils.checkId(movieId);

  const movieCollection = await movies();

  const reviews = await movieCollection.findOne(
    { _id: parsedMovieId },
    { projection: { _id: 0, reviews: 1 } }
  );

  if (reviews === null) {
    throw new Error(
      `Movies collection does not contain a movie with an id value of ${id}.`
    );
  }

  return reviews["reviews"];
};

module.exports = {
  createReview,
  getReviewById,
  getMovieReviews,
};
