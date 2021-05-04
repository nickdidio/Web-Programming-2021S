const express = require('express');
const router = express.Router();

router.use(express.static('public'));

// represents list of movies held in 'currentSession.compiledList', would be replaced w/ db call
groupMovies = ["Movie1", "Movie2", "Movie3", "Movie4", "Movie5", "Movie6", "Movie7", "Movie8"]

router.get('/', async (req, res) => {
    res.render('movieSelection/home')
});

router.get('/list', async (req, res) => {
    // will keep track of how many movies the user has selected yay/nay on (compared to total # of movies)
    req.session.user = { judged: 0, movie_count: groupMovies.length }
    // this would be a database call, ofc
    res.render('movieSelection/selection', { movies: groupMovies })
});

router.post('/choice', async (req, res) => {
    decision = req.params.dec
    movie = req.params.mov
    
    // First check if currentSession.selection != null. If it doesn't then, a movie has been selected,
    // and the user should return to group home page where the chosen movie will be displayed
    sesh = req.session.user
    sesh.judged++;
    if(decision) {
        // if 'yes' post response to map of movies -> 'currentSession.compiledList[movie]++'
        // also check if value of 'currentSession.compiledList[movie]' equals 'currentSession.threshold'
                    // if it is, set currentSession.selection equal to movie
    } else if(sesh.judged == sesh.movie_count) {
        // if user no longer has movies to judge, send them back to group home to
        // wait for the rest of group members to finish
    }
});

module.exports = router;