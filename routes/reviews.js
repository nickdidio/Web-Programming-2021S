const express = require("express");
const router = express.Router();
const utils = require("../utils");
const { reviews } = require("../data");
const xss = require("xss");

// GET /reviews/{movieId}
router.get("/:id", async (req, res) => {
  // validate movie id parameter
  const movieId = xss(req.params.id);
  try {
    utils.checkId(movieId);
  } catch (e) {
    res.status(404).render("errors/error",{ error: "Invalid ID" });
    return;
  }

  // try to fetch reviews for the movie
  try {
    const movieReviews = await reviews.getMovieReviews(xss(movieId));
    res.json(movieReviews);
  } catch (e) {
    res.status(404).render("errors/error",{ error: "Review Not found" });
    return;
  }
});

// POST /reviews/{movieId}
router.post("/:id", async (req, res) => {
  // check if movie id is a valid MongoDB id
  const movieId = xss(req.params.id);
  try {
    utils.checkId(movieId);
  } catch (e) {
    res.status(500).render("errors/error",{ error: xss(e.toString()) });
    return;
  }

  const { reviewDate, reviewText, rating, username } = req.body;

  try {
    utils.checkReviewParameters(reviewDate, reviewText, rating, username);
  } catch (e) {
    res.status(500).render("errors/error",{ error: xss(e.toString()) });
    return;
  }

  try {
    const newReview = await reviews.createReview(
      xss(reviewDate),
      xss(reviewText),
      parseInt(xss(rating)),
      xss(username),
      xss(movieId)
    );
    res.json(newReview);
  } catch (e) {
    res.status(500).render("errors/error",{ error: xss(e.toString()) });
    return;
  }
});

module.exports = router;
