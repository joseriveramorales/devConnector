// I need to bring the express router if I want to have routes in different files, it's always a good idea to break up these things in different resources
const express = require('express');
const router = express.Router();

// @route       GET api/auth
// @desc        Test route
// @access      Public
// La seccion de access la defino como public o private dependiendo de si necesito un token for Private o si no necesito un token for Public access of routes
router.get('/', (req, res) => res.send('Auth route'));

module.exports = router;