const express = require('express');
const router = express.Router();
const userDB = require('../data/users');
const groupDB = require('../data/groups')
const utils = require("../utils")
const { ObjectId } = require("mongodb");

//gets user's groups 
router.get('/', async (req, res) => {
    try{
        let userId = utils.checkId(req.session.user._id)
        let user = await userDB.getUserById(userId); //get userid from request
        console.log(user)
        if (user.userGroups) {
            let groupList = [];
            for (let groupId of user.userGroups) {
                let group = await groupDB.getGroupById(groupId);
                groupList.push({name: group.groupName, id: groupId});
            }
            res.render('groups/groupList', {groupList: groupList}) //renders page under groups/grouplist.handlebars
            return;
        }
        res.render('groups/groupList', {groupList: false}) //renders page under groups/grouplist.handlebars
        return;
    } catch (e) {
        throw new Error ("Could not get user groups");
    }
    
});

//Adds user to new group with id of id
router.get('/join/:id', async (req, res) => {
    if (!req.session.user._id) {
        res.redirect('/'); //redirect to login screen
        return;
    }
    let user = await userDB.getUserById(req.session.user._id); 
    let group = await groupDB.getGroupById(id);
    group = groupDB.addGroupMember(group._id, user._id);
    user = userDB.addGroupMember(user._id, group._id);
    res.render('groups/groupList', {groupList: user.groupList}) //renders page under groups/grouplist.handlebars

});

router.post('/create', async (req, res) => {
    console.log(req.body.groupName)
    let groupName = req.body.groupName;
    await groupDB.createGroup(req.session.user._id, groupName);
    res.redirect('.');
    return;
});



module.exports = router;