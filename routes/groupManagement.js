const express = require('express');
const router = express.Router();
const userDB = require('../data/users');
const groupDB = require('../data/groups')
const utils = require("../utils")
const { ObjectId } = require("mongodb");
const xss = require("xss");


//gets user's groups 
router.get('/', async (req, res) => {
    try{
        let userId = utils.checkId(req.session.user._id)
        let user = await userDB.getUserById(userId); //get userid from request
        if (user.userGroups) {
            let groupList = [];
            for (let groupId of user.userGroups) {
                let group = await groupDB.getGroupById(groupId);
                let leader = (group.groupLeaderId.toString() === userId.toString())
                console.log(group.currentSession.active)
                groupList.push({name: group.groupName, id: groupId, leader: leader, active: group.currentSession.active, user: user.firstName});
            }
            res.render('groups/groupList', {groupList: groupList}) //renders page under groups/grouplist.handlebars
            return;
        }
        res.render('groups/groupList', {groupList: false}) 
        return;
    } catch (e) {
        res.status(400).json({ error: xss("Could not get group list") });
    }
    
});

//Adds user to new group with id of id
router.post('/join', async (req, res) => {
    //todo: check user input
    try {
        let userId = (req.session.user._id)
        let request = xss(req.body.groupId)
        let groupId = request.toString()
        group = groupDB.addGroupMember(groupId, userId);
        res.redirect('.') 
    } catch (e) {
        res.status(400).json({ error: xss("Could not join group") });
    }
    

});

router.post('/create', async (req, res) => {
    try {
        let request = xss(req.body.groupName)
        let groupName = request;
        await groupDB.createGroup(req.session.user._id, groupName);
        res.redirect('.');
    } catch(e) {
        res.status(400).json({ error: xss("Could not create group") });
    }
    
});



module.exports = router;