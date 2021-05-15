const express = require('express');
const router = express.Router();
const groups = require('../data/groups');
const users = require('../data/users')
const pastSessions = require('../data/pastSessions');
const { movies } = require('../config/mongoCollections');
const session = require('express-session');
router.use(express.static('public'));

// sesh.active -> once a user enters starts judging, they're 'active' until a movie is selected as a winner by the group

router.get('/', async (req, res) => {
    sesh = req.session
    if(!req.session.user) {
        res.status(400).send("You must be logged in to access this page!")
    } else if(sesh.leader && !sesh.chosen) {
        // group leader shouldn't use this route
        return
    }

    sesh.groupID = req.query.id
    group = {}
    try {
        group = await groups.getGroupById(req.query.id)
    } catch(e) {
        res.status(400).send("<h3>That group doesn't exist!</h3>")
    }
    
    if(!group) {
        res.status(400).send("<h3>That group doesn't exist!</h3>")
        return
    }
    // fresh join (after leaving, or new session member)
    if(!sesh.chosen && !sesh.active) {
        if(group.currentSession.sessionMembers.includes(sesh.user._id) && group.currentSession.active) {
            //sesh.active = true
            res.redirect("/pick/list")
            return
        }
        // Load user's personal WtW list into group list
        sesh = req.session
        // User ID stored in session
    //watchList = await users.getWatchList(sesh.user._id)
        // 'updateWatchList' should also update sessionMembers in 'currentSession'
    //groups.updateWatchList(sesh.groupID, watchList, sesh.user._id)
        // This is the landing page for decision rooms
        // Decision rooms != watch groups, so anyone(?) can join a decision room
        res.render('movieSelection/home', 
        { 
            groupName: `${group.groupName}`,
            title: "Waiting on group leader...", 
            message: "Sit tight.",
            pick: "appear",
            exit: "appear",
            done: "gone"
        })
    
    } else if(sesh.active) {
        // return (early)
        res.render('movieSelection/home', 
        { 
            groupName: `${group.groupName}`,
            title: "Waiting on group members to pick movies.",
            exit: "appear",
            pick: "gone",
            done: "appear",
            error: ""
        })
    } else {
        // return (movie chosen)
        movie_info = await movie.getMovieById(group.currentSession.chosen)
        /*res.render('movieSelection/home', 
        { 
            title: `Chosen movie: ${movie_info.title}`,
            exit: "appear",
            pick: "gone",
            enter_button: "gone",
            img: movie_info.img,
            error: ""
        })*/
        movie_info.title = `Chosen movie:
                            ${movie_info.title}`
        res.render('movies/movieDetails',
        {
            movie: movie_info
        })
    }
});

router.get('/done', async(req, res) => {
    if(!req.session.user) {
        res.status(403).send("You must be logged in to access this page!")
    }
    group = await groups.getGroupById(req.session.groupID)
    if(group.currentSession.chosen != "na") {
        sesh.chosen = true
        sesh.active = false
        res.redirect("/pick")
        return
    } else {
        res.render('movieSelection/home', 
        {
            groupName: `${group.name}`,
            title: "Waiting on group members to pick movies.",
            exit: "appear",
            pick: "gone",
            done: "appear",
            error: "Chill out, your group members aren't ready yet."
        })
    }
})

router.get('/leave', async (req, res) => {
    // remove room-specific data from session
    sesh = req.session
    sesh.judged = undefined
    sesh.movie_list = undefined
    sesh.active = undefined
    sesh.movie_count = undefined
    sesh.chosen = undefined
    sesh.leader = undefined
    res.redirect("/")
})

router.get('/list', async (req, res) => {
    if(!req.session.user) {
        res.status(403).send("You must be logged in to access this page!")
    }

    sesh = req.session
    group = {}
    try {
        group = await groups.getGroupById(sesh.groupID)
    } catch(e) {
        console.log(e)
        res.status(400).send("<h3>Bad request!</h3>")
        return
    }
    // if user clicked "Pick Flicks" button too early, send them back
    if(!group.currentSession.active) {
        // should also present error message
        res.status(400).send("<h3>This group isn't active yet!</h3>")
        return
    }
    sesh.active = true
    // will keep track of how many movies the user has selected yay/nay on (compared to total # of movies)
    sesh.judged = 0
    // these ids would be converted into movie objects
    sesh.movie_list = []
    for(item of group.currentSession.movieList) {
        sesh.movie_list.push(item.movie)
    }
    if(sesh.movie_list.length == 0) {
        res.status(400).send("<h3>No movies to choose from!</h3>")
        return
    }
    /*for (const [key, value] of Object.entries(group.currentSession.roster)) {
        sesh.movie_list.push(value)
    }*/
    sesh.movie_count = sesh.movie_list.length
    movie = {}
    try {
        movie = await movies.getMovieById(sesh.movie_list[0])
    } catch(e) {
        console.log(e)
        res.status(400).send("<h3>Something went wrong getting that movie!</h3>")
        return
    }
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
        return
    } else if(!req.query[dec]) {
        res.status(400).send("Must provide a judgement! (yes/no).")
        return
    }
    decision = req.params.dec
    sesh = req.session
    movie = sesh.movie_list[sesh.judged] // movieID (from TMDb)
    group = {}
    try {
        group = await groups.getGroupById(sesh.groupID)
    } catch(e) {
        console.log(e)
        res.status(400).send("<h3>Bad request!</h3>")
        return
    }
    grpSession = group.currentSession
    // First check if grpSession.selection != null. If it doesn't then, a movie has been selected,
    // and the user should return to group home page where the chosen movie will be displayed
    if(grpSession.chosen != "na") {
        sesh.chosen = true
        sesh.active = false
        res.redirect('/pick')
        return
    }

    sesh.judged++;
    if(decision == "yes") {
        result = await groups.addVote(sesh.groupID, movie)
        if(result.winner) {
            // update current session with new chosen ID
            new_session = {
                sessionDate: grpSession.sessionDate,
                sessionMembers: grpSession.sessionMembers,
                voteCountNeeded: grpSession.voteCountNeeded,
                movieList: grpSession.movie_list,
                filters: grpSession.filters,
                chosen: result.movie,
                active: false
            }
            sesh.chosen = true
            sesh.active = false
            
            groups.updateSession(sesh.groupID, new_session)
            
            res.redirect('/pick')
            return
        }
        //groups.updateMovie(sesh.groupID, movie)
    } else if(sesh.judged == sesh.movie_count) {
        // if user no longer has movies to judge, send them back to group home to
        // wait for the rest of group members to finish
        sesh.active = true
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