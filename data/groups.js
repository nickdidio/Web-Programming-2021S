const mongoCollections = require("../config/mongoCollections.js");
const { ObjectId } = require("mongodb");
const groups = mongoCollections.groups;
group = {
    _id: "12",
    groupName: "group",
        groupMembers: ["1"], //includes group leader
        currentSession: {
            voteCountNeeded: 2,
            sessionDate: "Now",
            sessionMembers: ["1", "2", "3"],
            movieList: [
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
                    "genre": ["Musical", "Horror", "Western", "Thriller"],
                    "votes": 0
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
                    "genre": ["Musical", "Horror", "Western", "Thriller"],
                    "votes": 0
                },
                {
                    "_id": "3",
                    "title": "Cats 3",
                    "desc": "A bunch of cats singing 2",
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
                    "genre": ["Musical", "Horror", "Western", "Thriller"],
                      "votes": 1
                },
                {
                    "_id": "4",
                    "title": "Cats 4",
                    "desc": "A bunch of cats singing 2",
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
                    "genre": ["Musical", "Horror", "Western", "Thriller"],
                    "votes": 0
                }
            ],
            filters: [],
            chosen: 'na',
            active: true
        }, 
        pastSessions: []
}

function addVote(id, mov) {
    for(movie of group.currentSession.movieList) {
        if(movie._id == mov) {
            movie.votes++
            //console.log(movie.votes + "," + group.currentSession.voteCountNeeded)
            if(movie.votes == group.currentSession.voteCountNeeded) {
                //console.log(movie.votes + ",," + group.currentSession.voteCountNeeded)
                group.currentSession.chosen = movie
                return { mov, winner: true }
            }
            return { mov, winner: false }
        }
    }
}

function getGroupById(id) {
    console.log(id + " " + group._id)
    if(id = group._id) {
        return group
    } else {
        return undefined
    }
}
module.exports = {
    getGroupById,
    addVote
};
