const express = require('express');
const router = express.Router();
const groups = require('./groups');

router.use(express.static('public'));

router.get('/', async (req, res) => {
    res.render('movieSelection/home')
});

router.get('/list', async (req, res) => {
    sesh = req.session.user
    group = await groups.getGroup(sesh.groupID)

    // will keep track of how many movies the user has selected yay/nay on (compared to total # of movies)
    sesh.judged = 0
    sesh.movie_count = group.groupMovieList.length
    res.render('movieSelection/selection', { movies: group.groupMovieList })
});

router.post('/choice', async (req, res) => {
    decision = req.params.dec
    movie = req.params.mov
    group = groups.getGroup(sesh.groupID)
    grpSession = group.currentSession
    // First check if grpSession.selection != null. If it doesn't then, a movie has been selected,
    // and the user should return to group home page where the chosen movie will be displayed
    sesh = req.session.user
    sesh.judged++;
    if(decision) {
        // if 'yes' post response to map of movies -> 'grpSession.compiledList[movie]++'
        // also check if value of 'grpSession.compiledList[movie]' equals 'grpSession.threshold'
                    // if it is, set grpSession.selection equal to movie
    } else if(sesh.judged == sesh.movie_count) {
        // if user no longer has movies to judge, send them back to group home to
        // wait for the rest of group members to finish
    }
});

module.exports = router;