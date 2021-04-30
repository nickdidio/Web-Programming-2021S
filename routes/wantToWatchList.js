const express = require('express');
const router = express.Router();
const xss = require('xss');


// The search bar version of building the list
router.get('/search', (req, res) => {

});

// The random version for building the list
router.get('/random', (req, res) => {

});

// The main home version for building the list
router.get('/', (req, res) => {
    res.render('wantToWatchList/home');
});

module.exports = router;