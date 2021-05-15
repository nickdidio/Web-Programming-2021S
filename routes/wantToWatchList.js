const { movies, users, reviews } = require("../data");
const express = require("express");
const axios = require("axios");
const router = express.Router();
const xss = require("xss");
const dotenv = require("dotenv");
const utils = require("../utils");
dotenv.config();
const apiKey = process.env.API_KEY;

//How to view and remove items from list
router.get("/", async (req, res) => {
  const watchListIds = await users.getWatchList(xss(req.session.user._id));
  let watchList = [];
  let m;
  try {
    for (let i = 0; i < watchListIds.length; i++) {
      m = await movies.getMovieById(watchListIds[i]);
      watchList.push(m);
      watchList[i].moreDetailsRoute = "/wantToWatchList/movieDetails/" + m._id;
      utils.editMovieForViews(m, `/wantToWatchList/`);
    }
  } catch (e) {
    res.status(500).json({ error: e.toString() });
    return;
  }

  if (req.body && req.body.error) {
    console.log(req.body.error);
  }
  if (watchList) {
    res.status(200);
    res.render("wantToWatchList/removeFromWatchList", {
      movieList: watchList,
      title: "My Watch List",
    });
  } else {
    res.status(500).json({ error: xss("Watch List Failed") });
    return;
  }
});

// Add a movie to the mongoDB movie database and user wantToWatchList database
router.post("/add", async (req, res) => {
  if (!xss(req.body.movieId) || typeof xss(req.body.movieId) !== "string") {
    res.status(400).json({ error: "Error: movieId not found" });
    return;
  }

  const tmdbId = xss(req.body.movieId);

  let movie;
  try {
    movie = await TMDbIdGet(tmdbId);
  } catch (e) {
    res.status(500).json({ error: xss(e.toString()) });
    return;
  }

  // if the movie is not already in the movie database
  if (!movie._id) {
    const {
      title,
      desc,
      img,
      releaseYear,
      runtime,
      mpaaRating,
      genre,
      TMDbId,
    } = movie;

    try {
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
    } catch (e) {
      res.status(400).json({ error: xss(e.toString()) });
      return;
    }
    for (let i = 0; i < genre.length; i++) {
      genre[i] = xss(genre[i]);
    }
    try {
      movie = await movies.createMovie(
        xss(title),
        xss(desc),
        xss(img),
        xss(releaseYear),
        parseInt(xss(runtime)),
        xss(mpaaRating),
        genre,
        parseInt(xss(TMDbId))
      );
    } catch (e) {
      res.status(500).json({ error: xss(e.toString()) });
    }
  }
  try {
    const found = await users.addToWatchList(req.session.user._id, movie._id);
    if (found) {
      res.json(true);
    }
    return;
  } catch (e) {
    res.status(500).json({ error: xss(e.toString()) });
    res.json(false);
  }
});

// Remove a movie from the user wantToWatchList database
router.patch("/remove", async (req, res) => {
  if (!xss(req.body.movieId) || typeof xss(req.body.movieId) !== "string") {
    res.status(400).json({ error: "Error: movieId not found" });
    return;
  }

  let movie;
  try {
    movie = await movies.getMovieById(xss(req.body.movieId));
  } catch (e) {
    res.status(500).json({ error: xss(e.toString()) });
    return;
  }
  try {
    if (!movie || !movie._id)
      throw new Error("Error: Movie not found in movie database");

    if (await users.removeFromWatchList(req.session.user._id, movie._id)) {
      res.json(true);
      return;
    }
  } catch (e) {
    res.status(500).json({ error: xss(e.toString()) });
    return;
  }
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
router.get("/", async (req, res) => {
  const watchListIds = await users.getWatchList(req.session.user._id);
  let watchList = [];
  for (let i = 0; i < watchListIds.length; i++) {
    watchList.push(await movies.getMovieById(watchListIds[i]));
  }
  if (watchList) {
    res.status(200);
    res.render("wantToWatchList/removeFromWatchList", {
      movieList: watchList,
      title: "My Watch List",
    });
  } else {
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

// Get a movie based on its TMDb Id
const TMDbIdGet = async (TMDbId) => {
  if (isNaN(TMDbId) || TMDbId < 1) {
    throw "Must provide a positive, integer value for the TMDbId parameter.";
  }
  try {
    let movie = await movies.getMovieByTMDbId(parseInt(xss(TMDbId)));
    if (Object.keys(movie).length === 0) {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/movie/${TMDbId}?api_key=${apiKey}&language=en-US&append_to_response=release_dates`
      );
      movie = {
        title: data.title ? data.title : "N/A",
        desc: data.overview ? data.overview : "N/A",
        img: data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : "../public/images/no_image.jpeg",
        releaseYear: data.release_date,
        runtime: data.runtime ? data.runtime : "N/A",
        genre: data.genres ? data.genres.map((g) => g.name) : [],
        TMDbId: data.id,
      };
      movie.mpaaRating = "NR";

      for (let i = 0; i < data.release_dates.results.length; i++) {
        if (data.release_dates.results[i].iso_3166_1 == "US") {
          // if the rating exists and is not NR
          if (
            data.release_dates.results[i].release_dates[0].certification &&
            data.release_dates.results[i].release_dates[0].certification != "NR"
          ) {
            movie.mpaaRating =
              data.release_dates.results[i].release_dates[0].certification;
          }
          break;
        }
      }
    }

    return movie;
  } catch (e) {
    throw new Error(`Movie not found with TMDb id value of ${TMDbId}`);
  }
};

// GET /wantToWatchList/movies/TMDbId/:id
router.get("/movies/TMDbId/:id", async (req, res) => {
  // try to fetch movie by TMDbId id
  try {
    const movie = await TMDbIdGet(req.params.id);
    res.json(movie);
  } catch (e) {
    res.status(404).json({ error: xss(e.toString()) });
    return;
  }
});

// GET /wantToWatchList/
router.get("/movieDetails/:id", async (req, res) => {
  const movieId = req.params.id;
  try {
    utils.checkId(movieId);
  } catch (e) {
    res.status(400).json({ error: xss("Invalid id") });
    return;
  }

  let movie;

  // try to fetch movie
  try {
    movie = await movies.getMovieById(xss(movieId));
  } catch (e) {
    res.status(404).json({ error: xss("Movie not found") });
    return;
  }

  utils.editMovieForViews(movie, `/wantToWatchList/movieDetails/${movie._id}`);

  res.render("movies/movieDetails", { title: movie.title, movie: movie });
  res.status(200);
});

module.exports = router;
