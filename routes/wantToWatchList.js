const express = require("express");
const router = express.Router();
const xss = require("xss");
const dotenv = require("dotenv");
const axios = require("axios");
const utils = rquire('../utils')
dotenv.config();
const apiKey = process.env.API_KEY;
const { data } = require("../data");
const movies = data.movies;
const users = data.users;


// Add a movie to the mongoDB movie database and user wantToWatchList database
router.post("/add", (req, res) => {
  const userId = utils.checkId(req.session.user.id);
  if(!req.body.movieId || typeof req.body.movieId !== "string") throw "Error: movieId not found"
  const tmdbId = xss(req.body.movieId);
  let movie = utils.tmdbIdGet(tmdbId);

  // if the movie is not already in the movie database
  if(!movie || !movie._id){
    utils.checkMovieParameters(movie);
    movie = movies.createMovie(
      movie.title,
      movie.desc,
      movie.img,
      movie.releaseYear,
      movie.runtime,
      movie.mpaaRating,
      movie.genre,
      movie.TMDbId,
    );
  }

  if(users.addToWatchList(userId,movie._id)) res.json(false);
  res.json(true);
});

// Remove a movie from the user wantToWatchList database
router.post("/remove", (req, res) => {
  const userId = utils.checkId(req.session.user.id);
  if(!req.body.movieId || typeof req.body.movieId !== "string") throw "Error: movieId not found"
  const tmdbId = xss(req.body.movieId);
  let movie = utils.tmdbIdGet(tmdbId);
  if(!movie || !movie._id) throw "Error: Movie not found in movie database";

  if(users.removeFromWatchList(userId,movie._id)) res.json(true);
  res.json(false);
});

// The main home version for building the list
router.get("/add", (req, res) => {
  res.status(200);
  res.render("wantToWatchList/addToWatchList", {
    title: "Add to My Watch List",
  });
});

//How to view and remove items from list
router.get("/remove", (req, res) => {
  const userId = utils.checkId(req.session.user.id);
  const watchList = users.getWatchList(userId)
  if(watchList){
    res.status(200);
    res.render("wantToWatchList/removeFromWatchList", {
      movieList: watchList,
      title: "My Watch List",
    });
  }else{
    res.status(500).json({ error: xss("Watch List Failed") });
    return;
  }
});

// Use TMDb API to get query results
router.get("/userQuery/:q", async (req, res) => {
  const q = req.params.q.trim();

  if (!q) {
    res.status(400).json({ error: xss("Invalid query") });
    return;
  }

  try {
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${q}`
    );
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: xss("No results for this query") });
    return;
  }
});

// Use TMdb API to get random page
router.get("/random/:randPage", async (req, res) => {
  const randPage = Number(req.params.randPage);

  if (!randPage || randPage < 0) {
    res.status(400).json({ error: xss("Invalid random page number") });
    return;
  }

  try {
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randPage}`
    );
    res.json(data);
  } catch (e) {
    res.status(404).json({ error: xss("No results for this random page") });
    return;
  }
});

module.exports = router;
