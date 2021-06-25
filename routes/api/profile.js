// I need to bring the express router if I want to have routes in different files, it's always a good idea to break up these things in different resources
const express = require('express');
const router = express.Router();
const auth = require('../../midleware/auth');
const profile = require('../../Models/Profile');
const user = require('../../Models/User');

// @route       GET api/profile/me
// @desc        Get my own profile ( user's profile)
// @access      Private 
// Not anybody can get my own profile
router.get('/me', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;