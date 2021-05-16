const express = require("express");
const router = express.Router();
const userDB = require("../data/users");
const groupDB = require("../data/groups");
const utils = require("../utils");
const xss = require("xss");
const { groups } = require("../config/mongoCollections");

//gets user's groups
router.get("/", async (req, res) => {
  try {
    let userId = utils.checkId(req.session.user._id);
    let user = await userDB.getUserById(""+userId); //get userid from request
    if (user.userGroups) {
      let groupList = [];
      for (let groupId of user.userGroups) {
          let group = await groupDB.getGroupById(groupId);
          let leader = (group.groupLeaderId.toString() === userId.toString())
          groupList.push({name: group.groupName, id: groupId, leader: leader, active: group.currentSession.active, user: user.firstName});
      }
      res.render('groups/groupList', {groupList: groupList, title: "Group List"}) //renders page under groups/grouplist.handlebars
      return
    }
  } catch (e) {
        res.status(500).render("errors/error",{ error: "Could not get group list" });
    res.render("groups/groupList", { groupList: false }); //renders page under groups/grouplist.handlebars
    return;

  } 
});

//gets user's groups
router.get("/", async (req, res) => {
  if (!req.session.user) {
    res.status(400).send("You must be logged in to access this page!");
  }
  try {
    let userId = utils.checkId(req.session.user._id);
    let user = await userDB.getUserById(userId); //get userid from request
    if (user.userGroups) {
      let groupList = [];
      for (let groupId of user.userGroups) {
        let group = await groupDB.getGroupById(groupId);
        let leader = group.groupLeaderId.toString() === userId.toString();
        groupList.push({
          name: group.groupName,
          id: groupId,
          leader: leader,
          active: group.currentSession.active,
          user: user.firstName,
        });
      }
      res.render("groups/groupList", { groupList: groupList }); 
      return;
    }
    res.render("groups/groupList", { groupList: false });
    return;
  } catch (e) {
    res
      .status(500)
      .render("errors/error", { error: "Could not get group list" });
      return;
  }
});
//Adds user to new group with id of id
router.post("/join", async (req, res) => {
  //todo: check user input
  try {
    utils.checkId(req.body.groupId);
  } catch (e) {
    res.status(400);
    res.render("errors/error", {
      title: "error",
      code: 400,
      error: xss("Invalid group id"),
    });
    return;
  }
  if (!req.session.user) {
    res.status(400).send("You must be logged in to access this page!");
  }
  try {
    let userId = req.session.user._id;
    let request = xss(req.body.groupId);
    console.log("GID: " + request);
    let groupId = request.toString();
    group = groupDB.addGroupMember(groupId, userId);
    res.redirect(`/pick?id=${groupId}`);
    return;
  } catch (e) {
    res.status(400).json({ error: xss("Could not join group") });
    return;
  }
});

router.post("/create", async (req, res) => {
  if(!req.body.groupName || typeof(req.body.groupName) != "string") {
      res.render("errors/error", {error: "Group name must be a valid string!", code: 400})
      return
  }
  try {
    let request = xss(req.body.groupName);
    let groupName = request;
    await groupDB.createGroup(req.session.user._id, groupName);
    res.redirect(".");
    return;
  } catch (e) {
    res.status(400).json({ error: xss("Could not create group") });
    return;
  }
});

// Sets currentSession.active = true (only visible to group leader)

router.post("/activate", async (req, res) => {
  //todo: check user input
  try {
    utils.checkId(req.body.groupId);
  } catch (e) {
    res.status(400);
    res.render("errors/error", {
      title: "error",
      code: 400,
      error: xss("Invalid group id"),
    });
    return;
  }
  try {
    sesh = req.session;
    sesh.groupID = req.body.groupId;
    filt = {
      mpaa: []
    }

    if(req.body.g) {
      filt.mpaa.push("G")
    }
    if(req.body.pg) {
      filt.mpaa.push("PG")
    }
    if(req.body.pg13) {
      filt.mpaa.push("PG-13")
    }
    if(req.body.r) {
      filt.mpaa.push("R")
    }
    if(req.body.nc17) {
      filt.mpaa.push("NC-17")
    }

    group = await groupDB.getGroupById(req.body.groupId);
    //console.log("GroupId: " + req.body.groupId);
    let new_session = {
      sessionDate: group.currentSession.sessionDate,
      sessionMembers: group.currentSession.sessionMembers,
      voteCountNeeded: (Math.floor(group.currentSession.sessionMembers.length / 2) + 1),
      movieList: [],
      filters: group.currentSession.filt,
      chosen: "na",
      active: true,
    };
    members = [group.currentSession.sessionMembers];
    console.log("Members: " + members);
    for (member of group.currentSession.sessionMembers) {
      movies = await userDB.getWatchList("" + member);
      //console.log(movies)
      for (m of movies) {
        allowed = await groupDB.applyFilters(filt, m)
        if(allowed) {
          new_session.movieList.push({ movie: m, votes: 0 });
        }
      }
    }
    console.log(await groupDB.updateSession(req.body.groupId, new_session));
    req.session.groupID = req.body.groupId;
    res.redirect("/pick/list");
    return;
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: xss("Could not join group") });
    return;
  }
});

module.exports = router;
