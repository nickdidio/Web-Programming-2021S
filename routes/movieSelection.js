const express = require('express');
const router = express.Router();
const groups = require('../data/groups');
const users = require('../data/users')
const pastSessions = require('../data/pastSessions')
router.use(express.static('public'));

router.get('/:id', async (req, res) => {
    group = await groups.getGroup(sesh.groupID)
    if(!group || group.active == false) {
        res.status(400).send("That group either doesn't exist or is inactive!")
        return
    }
    if(!sesh.chosen && !sesh.active) {
        // Load user's personal WtW list into group list
        sesh = req.session
        // User ID stored in session
        sesh.watchList = await users.getWWList(sesh._id)
        groups.updateWatchList(sesh.groupID, sesh.watchList)
        // This is the landing page for decision rooms
        // Decision rooms != watch groups, so anyone(?) can join a decision room
        res.render('movieSelection/home')
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

router.get('/list', async (req, res) => {
    sesh = req.session
    sesh.active = true
    group = await groups.getGroup(sesh.groupID)

    // will keep track of how many movies the user has selected yay/nay on (compared to total # of movies)
    sesh.judged = 0
    sesh.movie_count = group.groupMovieList.length
    res.render('movieSelection/selection', 
    { 
        movies: group.groupMovieList 
    })
});

router.post('/choice/:dec/:id', async (req, res) => {
    decision = req.params.dec
    movie = req.params.id // movieID (from TMDb)
    group = groups.getGroup(sesh.groupID)
    grpSession = group.currentSession
    // First check if grpSession.selection != null. If it doesn't then, a movie has been selected,
    // and the user should return to group home page where the chosen movie will be displayed
    if(grpSession.selection != "N/A") {
        res.redirect('/pick')
    }
    sesh = req.session.user
    sesh.judged++;
    if(decision) {
        // check if value of 'grpSession.compiledList[movie]' equals 'grpSession.threshold'- 1
        // (obviously, no need for additional DB call to update 'yes' count)
                    // if it is, set grpSession.selection equal to movie
        result = await groups.addVote(sesh.groupID, movie)
        if(result[1]) {
            // 'declareMovie()' is a db call that sets currentSession.selection equal to 'movieID'
            //  groups.declareMovie(sesh.groupID, movie) ^^ Could be done by "addVote" function
            sesh.chosen = true;
        }
        //groups.updateMovie(sesh.groupID, movie)
    } else if(sesh.judged == sesh.movie_count) {
        // if user no longer has movies to judge, send them back to group home to
        // wait for the rest of group members to finish
        res.redirect('/pick')
    }
    // get next movie based on user session
    next_movie = await movies.getMovieById(sesh.movie_list[sesh.judged])
    console.log(grpSession)
    res.render('movieSelection/selection', 
    { 
        movie: next_movie 
    })
});

module.exports = router;