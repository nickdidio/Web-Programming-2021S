const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const movies = mongoCollections.movies;
const utils = require("../utils");

/*
 * NOTE: ALL 'id' PARAMETERS TO FUNCTIONS ARE EXPECTED TO BE STRINGS
 */

// Error checks movie object parameters
const checkMovieParameters = (
  title,
  desc,
  img,
  releaseYear,
  runtime,
  mpaaRating,
  genre
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
  const validMPAAs = new Set(["G", "PG", "PG-13", "R", "NC-17", "Not Rated"]);

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
    !utils.isValidDateString(releaseYear)
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
};

const createMovie = async (
  title,
  desc,
  img,
  releaseYear,
  runtime,
  mpaaRating,
  genre
) => {
  // error check parameters
  checkMovieParameters(
    title,
    desc,
    img,
    releaseYear,
    runtime,
    mpaaRating,
    genre
  );

  // add new movie
  // TODO: Decide whether or not img link will be passed in its entirety
  let newMovie = {
    title,
    desc,
    // img: `https://image.tmdb.org/t/p/w500/${img}`,
    img,
    releaseYear,
    runtime,
    mpaaRating,
    genre,
    reviews: [],
    userAvgRating: null,
  };

  const movieCollection = await movies();

  const insertInfo = await movieCollection.insertOne(newMovie);

  if (insertInfo.insertedCount === 0) throw new Error("Could not add movie");

  return await getMovieById(insertInfo.insertedId.toString());
};

const getAllMovies = async () => {
  const movieCollection = await movies();

  const movieList = await movieCollection.find({}).toArray();

  movieList.forEach((movie) => {
    movie._id = movie._id.toString();
    movie.reviews.forEach((r) => {
      r._id = r._id.toString();
    });
  });

  return movieList;
};

const getMovieById = async (id) => {
  const parsedId = utils.checkId(id);

  const movieCollection = await movies();
  const movie = await movieCollection.findOne({ _id: parsedId });

  if (movie === null) {
    throw new Error(
      `Movies collection does not contain a movie with an id value of ${id}.`
    );
  }

  movie._id = movie._id.toString();
  movie.reviews.forEach((r) => {
    r._id = r._id.toString();
  });

  return movie;
};

const deleteMovie = async (id) => {
  const parsedId = ObjectId(id);

  const movieCollection = await movies();

  const deleted = await movieCollection.findOneAndDelete({
    _id: parsedId,
  });

  if (deleted.value === null) {
    throw new Error(`Could not delete movie with id of ${id}`);
  }

  return { movieId: id, deleted: true };
};

module.exports = {
  createMovie,
  getAllMovies,
  getMovieById,
  deleteMovie,
};
