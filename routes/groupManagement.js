const express = require("express");
const router = express.Router();
const userDB = require('../data/users');
const groupDB = require('../data/groups');
const utils = require("../utils")
const xss = require("xss");




//gets user's groups 
router.get('/', async (req, res) => {
    if (!req.session.user) {
        res.status(400).send("You must be logged in to access this page!")
    }
    try{
        let userId = utils.checkId(req.session.user._id)
        let user = await userDB.getUserById(userId); //get userid from request
        if (user.userGroups) {
            let groupList = [];
            for (let groupId of user.userGroups) {
                let group = await groupDB.getGroupById(groupId);
                let leader = (group.groupLeaderId.toString() === userId.toString())
                groupList.push({name: group.groupName, id: groupId, leader: leader, active: group.currentSession.active, user: user.firstName});
            }
            res.render('groups/groupList', {groupList: groupList}) //renders page under groups/grouplist.handlebars
            return;
        }
        res.render('groups/groupList', {groupList: false}) 
        return;
    } catch (e) {
        res.status(500).render("errors/error",{ error: "Could not get group list" });
    }
});
//Adds user to new group with id of id
router.post('/join', async (req, res) => {
    //todo: check user input
    if (!req.session.user) {
        res.status(400).send("You must be logged in to access this page!")
    }
    try {
        let userId = (req.session.user._id)
        let request = xss(req.body.groupId)
        console.log("GID: " + request)
        let groupId = request.toString()
        group = groupDB.addGroupMember(groupId, userId);
        res.redirect(`/pick?id=${groupId}`)
    } catch (e) {
        res.status(400).json({ error: xss("Could not join group") });
    }
});

router.post("/create", async (req, res) => {
  try {
    let request = xss(req.body.groupName);
    let groupName = request;
    await groupDB.createGroup(req.session.user._id, groupName);
    res.redirect(".");
  } catch (e) {
    res.status(400).json({ error: xss("Could not create group") });
  }
});

// Sets currentSession.active = true (only visible to group leader)
router.post('/activate', async (req, res) => {
    //todo: check user input
    try {
        group = await groupDB.getGroupById(req.body.groupId)
        console.log("Group: " + group)
        let new_session = {
            sessionDate: group.currentSession.sessionDate,
            sessionMembers: group.currentSession.sessionMembers,
            voteCountNeeded: group.currentSession.voteCountNeeded,
            movieList: [],
            filters: group.currentSession.filters,
            chosen: 'na',
            active: true
        };
        members = group.currentSession.sessionMembers
        console.log("Members: " + members)
        for(member of members) {
            movies = await userDB.getWatchList(member)
            //console.log(movies)
            for(m of movies) {
                new_session.movieList.push({movie: m, votes: 0})
            }
        }
        console.log(await groupDB.updateSession(req.body.groupId, new_session))
        req.session.groupID = req.body.groupId
        res.redirect('/pick/list')
        return
    } catch (e) {
        console.log(e)
        res.status(400).json({ error: xss("Could not join group") });
        return
    }
    
});

module.exports = router;
