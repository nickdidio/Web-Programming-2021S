const express = require("express");
const router = express.Router();
const utils = require("../utils");
const { movies } = require("../data");
const xss = require("xss");

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

// GET /movies/TMDbId/:id
router.get("/TMDbId/:id", async (req, res) => {
  // try to fetch movie by TMDbId id
  try {
    const movie = await utils.TMDbIdGet(req.params.id);
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
