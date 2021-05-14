const { movies, users } = require("../data");
const express = require("express");
const axios = require("axios");
const router = express.Router();
const xss = require("xss");
const dotenv = require("dotenv");
const utils = require("../utils");
dotenv.config();
const apiKey = process.env.API_KEY;

// Add a movie to the mongoDB movie database and user wantToWatchList database
router.post("/add", async (req, res) => {
  // TODO: MAKE SURE MOVIE IS POSTED TO USER WATCH LIST
  // const userId = utils.checkId(req.session.user._id.toString());
  if (!req.body.movieId || typeof req.body.movieId !== "string")
    throw "Error: movieId not found";
  const tmdbId = xss(req.body.movieId);
  let movie;
  try {
    movie = await TMDbIdGet(tmdbId);
  } catch (e) {
    res.status(500).json({ error: xss(e.toString()) });
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

    try {
      movie = await movies.createMovie(
        xss(title),
        xss(desc),
        xss(img),
        xss(releaseYear),
        parseInt(xss(runtime)),
        xss(mpaaRating),
        genre, // TODO: XSSS THIS THANG
        parseInt(xss(TMDbId))
      );
    } catch (e) {
      console.log(e.toString());
      res.status(500).json({ error: xss(e.toString()) });
    }
  }

  // if (users.addToWatchList(userId, movie._id)) {
  //   res.json(true);
  //   return;
  // }
  // res.json(false);
  res.json(true);
});

// Remove a movie from the user wantToWatchList database
router.post("/remove", (req, res) => {
  const userId = utils.checkId(req.session.user._id);
  if (!req.body.movieId || typeof req.body.movieId !== "string")
    throw "Error: movieId not found";
  const tmdbId = xss(req.body.movieId);
  let movie = tmdbIdGet(tmdbId);
  if (!movie || !movie._id) throw "Error: Movie not found in movie database";

  if (users.removeFromWatchList(userId, movie._id)) res.json(true);
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
router.get("/", (req, res) => {
  const userId = utils.checkId(req.session.user._id);
  const watchList = users.getWatchList(userId);
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
    res.status(400).json({
      error: xss(
        "Must provide a positive, integer value for the TMDbId parameter."
      ),
    });
    return;
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

// GET /movies/TMDbId/:id
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

module.exports = router;
