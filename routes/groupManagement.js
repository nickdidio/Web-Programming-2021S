const express = require("express");
const router = express.Router();
const userDB = require("../data/users");
const groupDB = require("../data/groups");
const utils = require("../utils");
const xss = require("xss");

//gets user's groups
router.get("/", async (req, res) => {
  try {
    let userId = utils.checkId(req.session.user._id);
    let user = await userDB.getUserById(userId); //get userid from request
    if (user.userGroups) {
      let groupList = [];
      for (let groupId of user.userGroups) {
        let group = await groupDB.getGroupById(groupId);
        let leader = group.groupLeaderId == userId;
        groupList.push({
          name: group.groupName,
          id: groupId,
          leader: leader,
          active: group.currentSession.active,
        });
      }
      res.render("groups/groupList", { groupList: groupList }); //renders page under groups/grouplist.handlebars
      return;
    }
    res.render("groups/groupList", { groupList: false }); //renders page under groups/grouplist.handlebars
    return;
  } catch (e) {
    res.status(400).json({ error: xss("Could not get group list") });
  }
});

//Adds user to new group with id of id
<<<<<<< HEAD
router.post("/join", async (req, res) => {
  //todo: check user input
  try {
    let userId = req.session.user._id;
    let request = xss(req.body.groupId);
    let groupId = request.toString();
    group = groupDB.addGroupMember(groupId, userId);
    res.redirect("/pick/");
  } catch (e) {
    res.status(400).json({ error: xss("Could not join group") });
  }
||||||| 960583d
router.post('/join', async (req, res) => {
    //todo: check user input
    try {
        let userId = (req.session.user._id)
        let request = xss(req.body.groupId)
        let groupId = request.toString()
        group = groupDB.addGroupMember(groupId, userId);
        res.redirect('/pick/') 
    } catch (e) {
        res.status(400).json({ error: xss("Could not join group") });
    }
    

=======
router.post('/join', async (req, res) => {
    //todo: check user input
    try {
        let userId = (req.session.user._id)
        let request = xss(req.body.groupId)
        let groupId = request.toString()
        group = groupDB.addGroupMember(groupId, userId);
        res.redirect(`/pick?id=${groupId}`)
    } catch (e) {
        res.status(400).json({ error: xss("Could not join group") });
    }
    

>>>>>>> 3f740bde216a0b4189b7ccef410ced89460cc52a
});

<<<<<<< HEAD
router.post("/create", async (req, res) => {
  try {
    let request = xss(req.body.groupName);
    let groupName = request;
    await groupDB.createGroup(req.session.user._id, groupName);
    // group.currentSession.active should be set to true, and groupWatchList compiled ^^^
    res.redirect("/pick/list");
  } catch (e) {
    res.status(400).json({ error: xss("Could not create group") });
  }
||||||| 960583d
router.post('/create', async (req, res) => {
    try {
        let request = xss(req.body.groupName)
        let groupName = request;
        await groupDB.createGroup(req.session.user._id, groupName);
        // group.currentSession.active should be set to true, and groupWatchList compiled ^^^
        res.redirect('/pick/list');
    } catch(e) {
        res.status(400).json({ error: xss("Could not create group") });
    }
    
=======
router.post('/create', async (req, res) => {
    try {
        let request = xss(req.body.groupName)
        let groupName = request;
        await groupDB.createGroup(req.session.user._id, groupName);
        // Should go to page where group.currentSession.active is set to true, and currentSession.watchList is compiled, and group code is presented
        res.redirect('.');
    } catch(e) {
        res.status(400).json({ error: xss("Could not create group") });
    }
    
>>>>>>> 3f740bde216a0b4189b7ccef410ced89460cc52a
});

module.exports = router;
