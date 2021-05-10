const { response } = require('express');
const express = require('express');
const router = express.Router();
const xss = require('xss');
const dotenv = require('dotenv');
dotenv.config();
const apiKey = process.env.API_KEY;


// Add a movie to the mongoDB movie database and user wantToWatchList database
router.post('/add', (req, res) => {
    //TODO: Implement
    res.json(true);
});

// Add a movie to the mongoDB movie database and user wantToWatchList database
router.post('/remove', (req, res) => {
    //TODO: Implement
    res.json(true);
});

// The main home version for building the list
router.get('/add', (req, res) => {
    res.status(200);
    res.render('wantToWatchList/addToWatchList', { title: "Add to My Watch List"});
});

//How to view and remove items from list
router.get('/remove', (req, res) => {
    res.status(200);
    res.render('wantToWatchList/removeFromWatchList', { movieList: ["happy gilmore", "nirvana: the doc", "hotel transylvania"], title: "My Watch List"});
});

router.get('/apikey', (req, res) => {
    res.json(apiKey);
});

module.exports = router;