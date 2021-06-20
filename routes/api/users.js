// I need to bring the express router if I want to have routes in different files, it's always a good idea to break up these things in different resources
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
// express-validator is a set of express.js middlewares that wraps validator.js validator and sanitizer functions.
//  String sanitization is used to avoid SQL injection onto the website due to dynamic SQL being used on the application. 
const { check, validationResult } = require('express-validator'); 
const User = require('../../Models/User')

// @route       POST api/users
// @desc        Register User
// @access      Public
// La seccion de access la defino como public o private dependiendo de si necesito un token for Private o si no necesito un token for Public access of routes

// Usando Express-validator para cotejar que los POST requests cumplen con los requisitos que defino, si no pues procedo a enviar un status en el response de 400 y listando // los errores encontrados.
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with minimum lenght of 6 characters.').isLength({ min: 6 })
    ],
    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json( {errors: errors.array()} );
    }

    const { name, email, password} = req.body;

    try{
        let user = await User.findOne({ email });

        // See if user already exists If he exists, send error
        if (user) {
            return res.status(400).json({ errors : [{ msg: 'User already exists'}]});
        }

        // Get users gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        }) 

        user = new User({
            name,
            email,
            avatar,
            password
        });

        // Encrypt password using Bcrypt. Como ya se sabe, cada vez que uno va a generar un hash a base de un string se debe usar un 'salt' para ayudar al randomness del // // algoritmo de hashing .
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);
        
        await user.save();

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