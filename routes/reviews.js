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
    res.status(404);
    res.render("errors/error", {
      title: "error",
      code: 404,
      error: "Invalid ID",
    });
    return;
  }

  // try to fetch reviews for the movie
  try {
    const movieReviews = await reviews.getMovieReviews(xss(movieId));
    res.json(movieReviews);
  } catch (e) {
    res.status(404);
    res.render("errors/error", {
      title: "Error",
      code: 404,
      error: "Review Not found",
    });
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
    res.status(500);
    res.render("errors/error", {
      title: "Error",
      code: 500,
      error: xss(e.toString()),
    });
    return;
  }

  const { reviewText, rating, redirect } = req.body;
  const d = new Date();
  const reviewDate = `${d.getFullYear()}-${d.getMonth()}-${d.getDay()}`;
  const username = req.session.user.username;

  try {
    utils.checkReviewParameters(
      reviewDate,
      reviewText,
      parseInt(rating),
      username
    );

    if (!redirect) {
      throw new Error("Must provide a path to redirect to");
    }
  } catch (e) {
    res.status(500);
    res.render("errors/error", {
      title: "Error",
      code: 500,
      error: xss(e.toString()),
    });
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
    res.redirect(redirect);
  } catch (e) {
    res.status(500);
    res.render("errors/error", {
      title: "Error",
      code: 500,
      error: xss(e.toString()),
    });
    return;
  }
});

module.exports = router;
