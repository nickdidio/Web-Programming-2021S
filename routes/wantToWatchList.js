const express = require("express");
const router = express.Router();
const xss = require("xss");
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();
const apiKey = process.env.API_KEY;

// Add a movie to the mongoDB movie database and user wantToWatchList database
router.post("/add", (req, res) => {
  //TODO: Implement
  res.json(true);
});

// Add a movie to the mongoDB movie database and user wantToWatchList database
router.post("/remove", (req, res) => {
  //TODO: Implement
  res.json(true);
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
  res.status(200);
  res.render("wantToWatchList/removeFromWatchList", {
    movieList: ["happy gilmore", "nirvana: the doc", "hotel transylvania"],
    title: "My Watch List",
  });
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
