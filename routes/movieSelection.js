const express = require('express');
const router = express.Router();
const groups = require('./groups');

router.use(express.static('public'));

router.get('/', async (req, res) => {
    // This is the landing page for decision rooms
    // Decision rooms != watch groups, so anyone(?) can join a decision room
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
    movie = req.params.mov // movieID (from TMDb)
    group = groups.getGroup(sesh.groupID)
    grpSession = group.currentSession
    // First check if grpSession.selection != null. If it doesn't then, a movie has been selected,
    // and the user should return to group home page where the chosen movie will be displayed
    if(grpSession.selection != "N/A") {
        res.redirect('/')
    }
    sesh = req.session.user
    sesh.judged++;
    if(decision) {
        // check if value of 'grpSession.compiledList[movie]' equals 'grpSession.threshold'- 1
        // (obviously, no need for additional DB call to update 'yes' count)
                    // if it is, set grpSession.selection equal to movie
        if(grpSession.movie == grpSession.threshold - 1) {
            // 'declareMovie() is a db call that sets currentSession.selection equal to 'movieID'
            groups.declareMovie(sesh.groupID, movie)
        }
        groups.updateMovie(movie)
    } else if(sesh.judged == sesh.movie_count) {
        // if user no longer has movies to judge, send them back to group home to
        // wait for the rest of group members to finish
        res.redirect('/')
    }
});

module.exports = router;