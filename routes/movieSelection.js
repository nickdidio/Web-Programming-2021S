const express = require('express');
const router = express.Router();
const groups = require('../data/groups');
const users = require('../data/users')
const pastSessions = require('../data/pastSessions');
const { movies } = require('../config/mongoCollections');
const session = require('express-session');
router.use(express.static('public'));

let movies_test = [
    {
        "_id": "1",
        "title": "Cats 1",
        "desc": "A bunch of cats singing 1",
        "img": "https://images.theconversation.com/files/350865/original/file-20200803-24-50u91u.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=675.0&fit=crop",
    "reviews":[{
        "_id": "8c7997a2-c0d2-4g8c-b27a-6c1d4b5b6310",
        "reviewDate": "04/02/2021",
        "reviewText": "PURRFECT. I loved Sir Patrick Stewart as the poop emoji!",
        "username": "man1",
        "rating": 5,
        "movieId": "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310"
          }],    
          "releaseYear": 2019,
        "runtime": 110,
        "mpaaRating": "PG",
        "userAvgRating": 1.1,
        "genre": ["Musical", "Horror", "Western", "Thriller"]
    },
    {
        "_id": "2",
        "title": "Cats 2",
        "desc": "A bunch of cats singing 2",
        "img": "https://images.theconversation.com/files/350865/original/file-20200803-24-50u91u.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=675.0&fit=crop",
    "reviews":[{
        "_id": "8c7997a2-c0d2-4g8c-b27a-6c1d4b5b6310",
        "reviewDate": "04/02/2021",
        "reviewText": "MeOOOOwww Cats is great!!! Absolutely PURRFECT. I loved Sir Patrick Stewart as the poop emoji!",
        "username": "man2",
        "rating": 5,
        "movieId": "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310"
          }],    
          "releaseYear": 2019,
        "runtime": 110,
        "mpaaRating": "PG",
        "userAvgRating": 1.1,
        "genre": ["Musical", "Horror", "Western", "Thriller"]
    },
    {
        "_id": "3",
        "title": "Cats 3",
        "desc": "A bunch of cats singing 3",
        "img": "https://images.theconversation.com/files/350865/original/file-20200803-24-50u91u.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=675.0&fit=crop",
    "reviews":[{
        "_id": "8c7997a2-c0d2-4g8c-b27a-6c1d4b5b6310",
        "reviewDate": "04/02/2021",
        "reviewText": "MeOOOOwww Cats is great!!! Absolutely PURRFECT. I loved Sir Patrick Stewart as the poop emoji!",
         "username": "man3",
        "rating": 5,
        "movieId": "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310"
          }],    
          "releaseYear": 2019,
        "runtime": 110,
        "mpaaRating": "PG",
        "userAvgRating": 1.1,
        "genre": ["Musical", "Horror", "Western", "Thriller"]
    },
    {
        "_id": "4",
        "title": "Cats 4",
        "desc": "A bunch of cats singing 4",
        "img": "https://images.theconversation.com/files/350865/original/file-20200803-24-50u91u.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=675.0&fit=crop",
    "reviews":[{
        "_id": "8c7997a2-c0d2-4g8c-b27a-6c1d4b5b6310",
        "reviewDate": "04/02/2021",
        "reviewText": "MeOOOOwww Cats is great!!! Absolutely PURRFECT. I loved Sir Patrick Stewart as the poop emoji!",
        "username": "man4",
        "rating": 5,
        "movieId": "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310"
          }],    
          "releaseYear": 2019,
        "runtime": 110,
        "mpaaRating": "PG",
        "userAvgRating": 1.1,
        "genre": ["Musical", "Horror", "Western", "Thriller"]
    }
]

// sesh.active -> once a user enters starts judging, they're 'active' until a movie is selected as a winner by the group

router.get('/', async (req, res) => {
    /*if(!req.session.user) {
        res.status(400).send("You must be logged in to access this page!")
    } else if(sesh.leader && !sesh.chosen) {
        // group leader shouldn't use this route
        return
    }*/
    sesh = req.session
    sesh.groupID = req.query.id
    group = await groups.getGroupById(req.query.id)
    if(!group) {
        res.status(400).send("That group doesn't exist!")
        return
    }
    // fresh join (after leaving, or new session member)
    if(!sesh.chosen && !sesh.active) {
        if(group.currentSession.sessionMembers.includes(sesh.user._id)) {
            //sesh.active = true
            res.redirect("/pick")
            return
        } else {
            group.currentSession.sessionMembers.push(sesh.user._id)
            res = groups.updateSession(sesh.groupID, group)
            if(!res) {
                res.status(400).send("Could not update currentSession")
                return
            }
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
    /*if(!req.session.user) {
        res.status(403).send("You must be logged in to access this page!")
    }*/
    group = await groups.getGroupById(req.session.groupID)
    //console.log(group)
    if(group.currentSession.chosen != "na") {
        sesh.chosen = true
        sesh.active = false
        res.redirect("/pick")
        return
    } else {
        console.log("Not done!")
        res.render('movieSelection/home', 
        { 
            title: "Waiting on group members to pick movies.",
            exit: "appear",
            pick: "gone",
            done: "appear",
            error: "Chill out, your group members aren't ready yet!"
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
    /*if(!req.session.user) {
        res.status(403).send("You must be logged in to access this page!")
    }*/
    sesh = req.session
    group = await groups.getGroupById(sesh.groupID)
    // if user clicked "Pick Flicks" button too early, send them back
    if(!group.currentSession.active) {
        // should present error message, and return to original page instead
        res.status(400).end()
        return
    }
    sesh.active = true
    // will keep track of how many movies the user has selected yay/nay on (compared to total # of movies)
    sesh.judged = 0
    // these ids would be converted into movie objects
    sesh.movie_list = movies_test
    /*for(item of group.currentSession.movieList) {
        sesh.movie_list.push(item.movie)
    }*/
    /*for (const [key, value] of Object.entries(group.currentSession.roster)) {
        sesh.movie_list.push(value)
    }*/
    sesh.movie_count = sesh.movie_list.length
    
    //movie = await movies.getMovieById(sesh.movie_list[0])
    movie = sesh.movie_list[0]
    res.render('movieSelection/selection', 
    { 
        movie: movie,
        genres: movie.genre,
        reviews: movie.reviews
    })
});

router.post('/choice/:dec', async (req, res) => {
    /*if(!req.session.user) {
        res.status(403).send("You must be logged in to access this page!")
        return
    } else if(!req.params.dec) {
        res.status(400).send("Must provide a judgement! (yes/no).")
        return
    }*/
    decision = req.params.dec
    sesh = req.session
    movie = sesh.movie_list[sesh.judged] // movieID (from TMDb)
    group = groups.getGroupById(sesh.groupID)
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
        console.log("mS: " + sesh.groupID + " " + movie._id)
        result = await groups.addVote(sesh.groupID, movie._id)
        console.log(result)
        if(result.winner) {
            //  groups.declareMovie(sesh.groupID, movie) ^^ Could be done by "addVote" function\
            sesh.chosen = true
            sesh.active = false
            res.redirect('/pick')
            return
        } else if(sesh.judged == sesh.movie_count) {
            sesh.active = true
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
    console.log(sesh.judged + " " + sesh.movie_count)
    // get next movie based on user session progress
    //next_movie = await movies.getMovieById(sesh.movie_list[sesh.judged])
    next_movie = sesh.movie_list[sesh.judged]
    //console.log(grpSession)
    res.render('movieSelection/selection', 
    { 
        movie: next_movie,
        reviews: next_movie.reviews,
        genres: next_movie.genre
    })
});

module.exports = router;