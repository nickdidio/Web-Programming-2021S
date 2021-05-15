const express = require("express");
const router = express.Router();
const utils = require("../utils");
const { movies } = require("../data");
const xss = require("xss");
const dotenv = require("dotenv");

dotenv.config();
const apiKey = process.env.API_KEY;

// GET /movies/:id
router.get("/:id", async (req, res) => {
  // validate movie id parameter
  const movieId = req.params.id;
  try {
    utils.checkId(movieId);
  } catch (e) {
    res.status(400);
    res.render("errors/error", {
      title: "error",
      code: 400,
      error: xss("Invalid id"),
    });
    return;
  }

  // try to fetch movie
  try {
    const movie = await movies.getMovieById(xss(movieId));
    res.json(movie);
  } catch (e) {
    res.status(400);
    res.render("errors/error", {
      title: "error",
      code: 400,
      error: xss("Movie not found"),
    });
    return;
  }
});

module.exports = router;
