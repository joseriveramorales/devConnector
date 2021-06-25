// I need to bring the express router if I want to have routes in different files, it's always a good idea to break up these things in different resources
const express = require('express');
const router = express.Router();
const auth = require('../../midleware/auth');
const User = require('../../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator'); 

// @route       GET api/auth
// @desc        Test route
// @access      Protected
// La seccion de access la defino como public o private dependiendo de si necesito un token for Private o si no necesito un token for Public access of routes
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        return res.json(user);
    }
    catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route       POST api/auth
// @desc        Authenticate user and get token
// @access      Public
// Este Post request sera utilizado para que los usuarios me den sus credenciales y yo les entregue un token validando que tienen acceso a ese user en paerticular.
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
    ],
    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json( {errorss: errors.array()} );
    }

    const {email, password} = req.body;

    try{
        let user = await User.findOne({ email });

        // See if user already exists If he exists, and the password is correct, generate token?
        if (!user) {
            return res.status(400).json({ errors : [{ msg: 'Invalid Credentials'}]});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if(!isMatch){
            return res.status(400).json( {errors: errors.array()} );
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get('secret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch(err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;