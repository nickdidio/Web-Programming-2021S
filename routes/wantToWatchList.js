const { response } = require('express');
const express = require('express');
const router = express.Router();
const xss = require('xss');


// Add a movie to the mongoDB movie database and user wantToWatchList database
router.post('/add', (req, res) => {
    //TODO: Implement
    res.json(true);
});

// The main home version for building the list
router.get('/add', (req, res) => {
    res.render('wantToWatchList/addToWatchList');
});

//How to view and remove items from list
router.get('/remove', (req, res) => {
    res.render('wantToWatchList/removeFromWatchList', {movieList: ["happy gilmore", "nirvana: the doc", "hotel transylvania"]});
});


module.exports = router;