const express = require('express');
const router = express.Router();
const userDB = require('../data/users');
const groupDB = require('../data/groups')

//gets user's groups 
router.get('/', async (req, res) => {
    try{
        let user = await userDB.getUserById(req.params.id); //get userid from request
        let groupList = user.groupList;
        let groupNames = [];
        for (groupId of groupList) {
            let group = await groupDB.getGroupById(groupId);
            groupNames.push(group.groupName);
        }
        res.render('groups/groupList', {groupList: groupList, groupNames: groupNames}) //renders page under groups/grouplist.handlebars
    } catch (e) {
        throw new Error ("Could not get group")
    }
    
});

//Adds user to new group with id of id
router.get('/join/:id', async (req, res) => {
    let user = await userDB.getUserById(req.params.id); 
    let group = await groupDB.getGroupById(id);
    group = groupDB.addGroupMember(group._id, user._id);
    user = userDB.addGroupMember(user._id, group._id);

    res.render('groups/groupList', {groupList: user.groupList}) //renders page under groups/grouplist.handlebars

});



module.exports = router;