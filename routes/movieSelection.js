const express = require('express');
const router = express.Router();
const groups = require('../data/groups');
const users = require('../data/users')
const pastSessions = require('../data/pastSessions');
const { movies } = require('../config/mongoCollections');
const session = require('express-session');
router.use(express.static('public'));

router.get('/', async (req, res) => {
    if(!req.session.user) {
        res.status(403).send("You must be logged in to access this page!")
    }
    sesh = req.session
    sesh.groupID = req.query[id]
    group = await groups.getGroup(req.query[id])
    if(!group || group.currentSession.active == false) {
        res.status(400).send("That group either doesn't exist or is inactive!")
        return
    }
    if(!sesh.chosen && !sesh.active) {
        // Load user's personal WtW list into group list
        sesh = req.session
        // User ID stored in session
        watchList = await users.getWatchList(sesh.user_id)
        groups.updateWatchList(sesh.groupID, watchList)
        // This is the landing page for decision rooms
        // Decision rooms != watch groups, so anyone(?) can join a decision room
        res.render('movieSelection/home', 
        { 
            title: "Waiting on group leader...", 
            message: "Sit tight.",
            pick: "gone",
            exit: "appear" 
        })
    } else if(sesh.active) {
        // return (early)
        res.render('movieSelection/home', 
        { 
            title: "Waiting on group members to pick movies.",
            exit: "appear",
            pick: "gone",
            enter_button: "gone"
        })
    } else {
        // return (movie chosen)
        movie_info = await movie.getMovieById(group.currentSession.chosen)
        res.render('movieSelection/home', 
        { 
            title: `Chosen movie: ${movie_info.title}`,
            exit: "appear",
            pick: "gone",
            enter_button: "gone",
            img: movie_info.img
        })
    }
});

router.get('/leave', async (req, res) => {
    // remove room-specific data from session
    sesh = req.session
    sesh.judged = undefined
    sesh.movie_list = undefined
    sesh.active = undefined
    sesh.movie_count = undefined
    res.status(404).end()
})

router.get('/list', async (req, res) => {
    if(!req.session.user) {
        res.status(403).send("You must be logged in to access this page!")
    }
    sesh = req.session
    group = await groups.getGroup(sesh.groupID)
    // if user clicked "Pick Flicks" button too early, send them back
    if(!group.currentSession.active) {
        // returns error message
        res.status(400)
        return
    }
    sesh.active = true
    // will keep track of how many movies the user has selected yay/nay on (compared to total # of movies)
    sesh.judged = 0
    sesh.movie_count = group.currentSession.watchList.length
    // these ids would be converted into movie objects, theoretically
    sesh.movie_list = group.currentSession.watchList
    movie = await movies.getMovieById(sesh.movie_list[0])
    res.render('movieSelection/selection', 
    { 
        movie: movie,
        genres: movie.genre,
        reviews: movie.reviews
    })
});

router.post('/choice/:dec', async (req, res) => {
    if(!req.session.user) {
        res.status(403).send("You must be logged in to access this page!")
    } else if(!req.query[dec]) {
        res.status(400).send("Must provide a judgement! (yes/no).")
    }
    decision = req.params.dec
    sesh = req.session
    movie = sesh.movie_list[sesh.judged] // movieID (from TMDb)
    group = groups.getGroup(sesh.groupID)
    grpSession = group.currentSession
    // First check if grpSession.selection != null. If it doesn't then, a movie has been selected,
    // and the user should return to group home page where the chosen movie will be displayed
    if(grpSession.chosen != "N/A") {
        res.redirect('/pick')
        return
    }

    sesh.judged++;
    if(decision == "yes") {
        // check if value of 'grpSession.compiledList[movie]' equals 'grpSession.threshold'- 1
        // (obviously, no need for additional DB call to update 'yes' count)
                    // if it is, set grpSession.selection equal to movie
        result = await groups.addVote(sesh.groupID, movie)
        if(result[1]) {
            // 'declareMovie()' is a db call that sets currentSession.selection equal to 'movieID'
            //  groups.declareMovie(sesh.groupID, movie) ^^ Could be done by "addVote" function\
            sesh.chosen = true
            res.redirect('/pick')
            return
        }
        //groups.updateMovie(sesh.groupID, movie)
    } else if(sesh.judged == sesh.movie_count) {
        // if user no longer has movies to judge, send them back to group home to
        // wait for the rest of group members to finish
        res.redirect('/pick')
        return
    }
    // get next movie based on user session progress
    next_movie = await movies.getMovieById(sesh.movie_list[sesh.judged])
    //console.log(grpSession)
    res.render('movieSelection/selection', 
    { 
        movie: next_movie,
        reviews: next_movie.reviews,
        genres: next_movie.genre
    })
});

module.exports = router;