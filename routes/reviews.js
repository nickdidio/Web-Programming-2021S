const express = require("express");
const router = express.Router();
const utils = require("../utils");
const { reviews } = require("../data");
const { ObjectId } = require("mongodb"); // temporary way to simulate userIds
const xss = require("xss");

// GET /reviews/{movieId}
router.get("/:id", async (req, res) => {
  // validate movie id parameter
  const movieId = req.params.id;
  try {
    utils.checkId(movieId);
  } catch (e) {
    res.status(400).json({ error: xss("Invalid id") });
    return;
  }

  // try to fetch reviews for the movie
  try {
    const movieReviews = await reviews.getMovieReviews(xss(movieId));
    res.json(movieReviews);
  } catch (e) {
    res.status(404).json({ error: xss("Movie not found") });
    return;
  }
});

// POST /reviews/{movieId}
router.post("/:id", async (req, res) => {
  // TODO: DETERMINE HOW USERID VALUE WILL BE OBTAINED

  // check if movie id is a valid MongoDB id
  const movieId = req.params.id;
  try {
    utils.checkId(movieId);
  } catch (e) {
    res.status(400).json({ error: xss(e.toString()) });
    return;
  }

  // check if user id is a valid MongoDb id
  const reviewerId = ObjectId().toString();
  //   const reviewerId = req.session.user;

  //   try {
  //     utils.checkId(reviewerId);
  //   } catch (e) {
  //     res.status(400)({ error: xss(xss)(e.toString()) });
  //     return;
  //   }

  // check validity of review date, text, and rating format
  const data = req.body;
  const { reviewDate, reviewText, rating } = data;

  if (
    typeof reviewDate !== "string" ||
    reviewDate.trim() === "" ||
    !utils.isValidDateString(reviewDate)
  ) {
    res.status(400).json({
      error: xss(
        "Must provide a value for review date of type string in YYYY-MM-DD format."
      ),
    });
    return;
  }

  if (typeof reviewText !== "string" || reviewText.trim() === "") {
    res.status(400).json({
      error: xss("Must provide a value for review text of type string."),
    });
    return;
  }

  if (typeof rating !== "number" || isNaN(rating) || rating > 5 || rating < 1) {
    res.status(400).json({
      error: xss(
        "Must provide a value for review rating that is positive integer between 1 and 5 (inclusive)."
      ),
    });
    return;
  }

  try {
    const newReview = await reviews.createReview(
      xss(reviewDate),
      xss(reviewText),
      xss(reviewerId),
      parseInt(xss(rating)),
      xss(movieId)
    );
    res.json(newReview);
  } catch (e) {
    res.status(500).json({ error: xss(e.toString()) });
  }
});

module.exports = router;
