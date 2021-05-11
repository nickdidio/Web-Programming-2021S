const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const movies = mongoCollections.movies;
const utils = require("../utils");

/*
 * NOTE: ALL 'id' PARAMETERS TO FUNCTIONS ARE EXPECTED TO BE STRINGS
 */

const createMovie = async (
  title,
  desc,
  img,
  releaseYear,
  runtime,
  mpaaRating,
  genre,
  TMDbId
) => {
  // error check parameters
  utils.checkMovieParameters(
    title,
    desc,
    img,
    releaseYear,
    runtime,
    mpaaRating,
    genre,
    TMDbId
  );

  if (Object.keys(await getMovieByTMDbId(TMDbId)).length !== 0) {
    throw new Error(
      "Could not add movie because it already exists in the database."
    );
  }

  // add new movie
  let newMovie = {
    title,
    desc,
    img,
    releaseYear,
    runtime,
    mpaaRating,
    genre,
    reviews: [],
    userAvgRating: null,
    TMDbId,
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

const getMovieByTMDbId = async (id) => {
  if (typeof id != "number" || id < 1) {
    throw new Error("Invalid TMDb value");
  }

  const movieCollection = await movies();
  const movie = await movieCollection.findOne({ TMDbId: id });

  if (movie === null) {
    return {};
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
  getMovieByTMDbId,
};
