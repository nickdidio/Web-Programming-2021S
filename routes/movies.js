const express = require("express");
const router = express.Router();
const utils = require("../utils");
const { movies } = require("../data");
const xss = require("xss");
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();
const apiKey = process.env.API_KEY;

// GET /movies/:id
router.get("/:id", async (req, res) => {
  // validate movie id parameter
  const movieId = req.params.id;
  try {
    utils.checkId(movieId);
  } catch (e) {
    res.status(400).json({ error: xss("Invalid id") });
    return;
  }

  // try to fetch movie
  try {
    const movie = await movies.getMovieById(xss(movieId));
    res.json(movie);
  } catch (e) {
    res.status(404).json({ error: xss("Movie not found") });
    return;
  }
});

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
        mpaaRating: data.release_dates.results.find(
          (elem) => elem.iso_3166_1 == "US"
        ).release_dates[0].certification,
        genre: data.genres ? data.genres.map((g) => g.name) : [],
        TMDbId: data.id,
      };
    }
    return movie;
  } catch (e) {
    throw new Error(`Movie not found with TMDb id value of ${TMDbId}`);
  }
};

// GET /movies/TMDbId/:id
router.get("/TMDbId/:id", async (req, res) => {
  // try to fetch movie by TMDbId id
  try {
    const movie = await TMDbIdGet(req.params.id);
    res.json(movie);
  } catch (e) {
    res.status(404).json({ error: xss(e.toString()) });
    return;
  }
});

// POST /movies/
router.post("/", async (req, res) => {
  const { title, desc, img, releaseYear, runtime, mpaaRating, genre, TMDbId } =
    req.body;

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
    const newMovie = await movies.createMovie(
      xss(title),
      xss(desc),
      xss(img),
      xss(releaseYear),
      parseInt(xss(runtime)),
      xss(mpaaRating),
      xss(genre),
      parseInt(xss(TMDbId))
    );
    res.json(newMovie);
  } catch (e) {
    res.status(500).json({ error: xss(e.toString()) });
  }
});

module.exports = router;
