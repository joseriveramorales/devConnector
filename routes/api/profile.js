// I need to bring the express router if I want to have routes in different files, it's always a good idea to break up these things in different resources
const express = require('express');
const request = require('request');
const config = require('config')
const router = express.Router();
const auth = require('../../midleware/auth');
const Profile = require('../../Models/Profile');
const User = require('../../Models/User');
const { check, validationResult } = require('express-validator');
const { findOneAndUpdate } = require('../../Models/User');

// @route       GET api/profile/me
// @desc        Get my own profile ( user's profile)
// @access      Private 
// Not anybody can get my own profile
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route       POST api/profile
// @desc       Create or update a user profile
// @access      Private 
// Not anybody can get my own profile
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', ' Skills is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    profileFields.social = {};
    if (facebook) profileFields.social.facebook = facebook;
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;



    try {
        let profile = await Profile.findOne({ user: req.user.id });
        // If the profile exists
        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id }, 
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile); 
        }

        // Create profile and save it to the DB

        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);



    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})




// @route       GET api/profile
// @desc        Route to get all profiles
// @access      Public 

router.get('/', async (req,res) => {
    try{
        const profiles = await Profile.find().populate('user',['name', 'avatar']);
        res.json(profiles);
    }catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
        }
    }
)


// @route       GET api/profile/user/:user_id
// @desc        Route to get all profiles
// @access      Public 

router.get('/user/:user_id', async (req,res) => {
    try{
        const profile = await Profile.findOne({ user: req.params.user_id}).populate('user',['name', 'avatar']);
        res.json(profile);

        if(!profile){
            return res.status(400).json({ msg: " There is no profile for this user."});
        }

    }catch(err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: " There is no profile for this user."});
        }
        res.status(500).send('Server error');
        
        }
    }
)



// @route       DELETE api/profile
// @desc        Delete profile, user and post
// @access      Private 

router.delete('/', auth, async (req,res) => {
    try{
        // @todo Remove all user posts

        await Profile.findOneAndRemove({ user: req.user.id});
        await User.findOneAndRemove({ _id: req.user.id});
        res.json({ msg : "User deleted"})
    }catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
        }
    }
)



// @route       PUT api/profile/experience
// @desc        Add profile experience
// @access      Private 


router.put('/experience', [auth, [
    check('title', ' Status is required').not().isEmpty(),
    check('company', ' Skills is required').not().isEmpty(),
    check('from', ' From date is required').not().isEmpty()
]], async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json( { errors: errors.array()})
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile);
        }catch(err) {
                console.error(err.message);
                res.status(500).send('Server error');
                }
            }
)


// @route       DELETE api/profile/experience
// @desc        Delete profile experience
// @access      Private 

router.delete('/experience/:exp_id', auth, async (req,res) => {
    try{
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);

        await profile.save();
        res.json({ profile,  msg : "Experience deleted"});

    }catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
        }
    }
)

// @route       PUT api/profile/education
// @desc        Add profile education
// @access      Private 


router.put('/education', [auth, [
    check('school', ' School is required').not().isEmpty(),
    check('degree', ' Degree is required').not().isEmpty(),
    check('fieldofstudy', ' Field of study date is required').not().isEmpty(),
    check('from', ' From is required').not().isEmpty(),
    check('to', ' To is required').not().isEmpty()
]], async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json( { errors: errors.array()})
        }

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.education.unshift(newExp);
            await profile.save();
            res.json(profile);
        }catch(err) {
                console.error(err.message);
                res.status(500).send('Server error');
                }
            }
)

// @route       DELETE api/profile/education
// @desc        Delete profile education
// @access      Private 

router.delete('/education/:edu_id', auth, async (req,res) => {
    try{
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json({ profile,  msg : "Education deleted"});

    }catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
        }
    }
)

// @route       GET api/profile/github/:username
// @desc        This will get user repos from github
// @access      Public because anybody can view github user profiles 

router.get('/github/:username', async(req,res) => {
    try{
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=$
            {config.get('githubClientSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        };

        request(options, (error, response, body) => {
            if(error) console.error(error);
            if (response.statusCode !== 200) {
                res.status(404).json( { msg: 'No github profile found'})
            }
            res.json(JSON.parse(body));
        });

    }catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
        }
})

module.exports = router;