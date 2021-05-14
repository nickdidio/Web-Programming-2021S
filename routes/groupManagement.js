const express = require('express');
const router = express.Router();
const userDB = require('../data/users');
const groupDB = require('../data/groups')



//gets user's groups 
router.get('/', async (req, res) => {
    try{
        let user = await userDB.getUserById(req.session.user._id); //get userid from request
        let groupList = user.groupList;
        let groupNames = [];
        for (groupId of groupList) {
            let group = await groupDB.getGroupById(groupId);
            groupNames.push(group.groupName);
        }
        console.log("HELP")
        res.render('groups/groupList', {groupList: groupList, groupNames: groupNames}) //renders page under groups/grouplist.handlebars
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
    //TODO implement group creation
});



module.exports = router;