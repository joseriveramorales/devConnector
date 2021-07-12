// I need to bring the express router if I want to have routes in different files, it's always a good idea to break up these things in different resources
const express = require('express');
const router = express.Router();
const auth = require('../../midleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../../Models/User');
const Post = require('../../Models/Post');
const Profile = require('../../Models/Profile');

// @route       POST api/posts
// @desc        Create a post
// @access      Private
// La seccion de access la defino como public o private dependiendo de si necesito un token for Private o si no necesito un token for Public access of routes
router.post('/',[auth, [
    check('text', 'Text is for a post to be created').not().isEmpty()
    ]
],
    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json( {errors: errors.array()} );
    }

    try{
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        post = await newPost.save();
        res.json(post);

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route       GET api/posts
// @desc        Get posts
// @access      Private
// La seccion de access la defino como public o private dependiendo de si necesito un token for Private o si no necesito un token for Public access of routes

router.get('/', auth, async (req, res) => {

    try{

    const posts = await Post.find().sort({ date: 'desc'});
    res.json(posts);


    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});


// @route       GET api/posts/:id
// @desc        Get post by ID
// @access      Private
// La seccion de access la defino como public o private dependiendo de si necesito un token for Private o si no necesito un token for Public access of routes

router.get('/:id', auth, async (req, res) => {

    try{
    const post = await Post.findById(req.params.id);

    if(!post){
        res.status(404).send({msg: 'Post not found '});
    }
    res.json(post);

    }catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            res.status(404).send({msg: 'Post not found '});
        }
        res.status(500).send('Server Error');
    }

});


// @route       DELETE api/posts/:id
// @desc        Deletye post by ID
// @access      Private
// La seccion de access la defino como public o private dependiendo de si necesito un token for Private o si no necesito un token for Public access of routes

router.delete('/:id', auth, async (req, res) => {

    try{

    const post = await Post.findById(req.params.id);

    if(!post){
        return res.status(404).send({msg: 'Post not found '});
    }

    if(post.user.toString() !== req.user.id){
        return res.status(401).json( { msg: 'User not authorized' });
    }
    await post.remove();
    res.json( { msg: 'Post removed' });

    }catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).send({msg: 'Post not found '});
        }
        res.status(500).send('Server Error');
    }

});


// @route       Put api/posts/like/:id
// @desc        Like a post
// @access      Private

router.put('/like/:id', auth, async(req, res) => {

    try{

    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).send({msg: 'Post not found '});
    }
    // check if the post has already been liked 
    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
        return res.status(400).json( {msg: 'Post already liked'});
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);


    }catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).send({msg: 'Post not found '});
        }
        res.status(500).send('Server Error');
    }
});


// @route       Put api/posts/unlike/:id
// @desc        Unlike a post
// @access      Private


router.put('/unlike/:id', auth, async(req, res) => {

    try{

    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).send({msg: 'Post not found '});
    }
    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
        return res.status(400).json( {msg: 'Post has not been liked. '});
    }

    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
    
    }catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).send({msg: 'Post not found '});
        }
        res.status(500).send('Server Error');
    }
});


// @route       PUT api/posts/comment/:id
// @desc        Add a comment to an existing post
// @access      Private

router.post('/comment/:id', [auth,[
    check('text', ' Text is required to perform a comment').not().isEmpty()
]], async(req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json( {errors: errors.array()} );
    }

    try{
    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).send({msg: 'Post not found '});
    }
    const user = await User.findById(req.user.id).select('-password');

    post.comments.unshift({
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
    })
    await post.save();
    res.json(post.comments);

    }catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).send({msg: 'Post not found '});
        }
        res.status(500).send('Server Error \n ' +  err);
    }
});


// @route       DELETE api/posts/comment/:id
// @desc        Delete a comment from an existing post.
// @access      Private

router.delete('/comment/:id/:comment_id', auth, async(req, res) => {


    try{
    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).send({msg: 'Post not found '});
    }
    // comments are a little different because a single user can make multiple comments, so I don't want to delete a comment just by matching the user 
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);
    if(!comment) {
        return res.status(404).json({ msg: " Comment does not exist"});
    }

    if(comment.user.toString() !== req.user.id){
        return res.status(401).json({msg: 'User not authorized'});
    }
    const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);

    }catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).send({msg: 'Post not found '});
        }
        res.status(500).send('Server Error');
    }
});


module.exports = router;