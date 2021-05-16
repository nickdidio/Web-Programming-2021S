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
    let user = await userDB.getUserById("" + userId); //get userid from request
    if (user.userGroups) {
      let groupList = [];
      for (let groupId of user.userGroups) {
        let group = await groupDB.getGroupById(groupId);
        let leader = group.groupLeaderId.toString() == userId.toString();
        groupList.push({
          name: group.groupName,
          id: groupId,
          leader: leader,
          active: group.currentSession.active,
        });
      }
      res.render("groups/groupList", {
        groupList: groupList,
        title: "Group List",
      }); //renders page under groups/grouplist.handlebars
      return;
    }
  } catch (e) {
    res
      .status(500)
      .render("errors/error", { error: "Could not get group list" });
    res.render("groups/groupList", { groupList: false }); //renders page under groups/grouplist.handlebars
    return;
<<<<<<< HEAD
  }
||||||| 7f655e8
  } catch (e) {
    console.log(e)
    res.status(400).json({ error: xss("Could not get group list") });
  }
=======
  } 
>>>>>>> 282d16ca6458af98cd2496cb3d6109cd9b8c9a19
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
  try {
    let request = xss(req.body.groupName);
    let groupName = request;
    await groupDB.createGroup(req.session.user._id.toString(), groupName);
    res.redirect(".");
    return;
  } catch (e) {
    res.status(400).json({ error: xss(e.toString()) });
  }
});

// Sets currentSession.active = true (only visible to group leader)

router.post("/activate", async (req, res) => {
  //todo: check user input
  try {
    sesh = req.session;
    sesh.groupID = req.body.groupId;
    group = await groupDB.getGroupById(req.body.groupId);
    console.log("GroupId: " + req.body.groupId);
    let new_session = {
      sessionDate: group.currentSession.sessionDate,
      sessionMembers: group.currentSession.sessionMembers,
      voteCountNeeded:
        Math.floor(group.currentSession.sessionMembers.length / 2) + 1,
      movieList: [],
      filters: group.currentSession.filters,
      chosen: "na",
      active: true,
    };
    members = [group.currentSession.sessionMembers];
    console.log("Members: " + members);
    for (member of group.currentSession.sessionMembers) {
      movies = await userDB.getWatchList("" + member);
      //console.log(movies)
      for (m of movies) {
        new_session.movieList.push({ movie: m, votes: 0 });
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
