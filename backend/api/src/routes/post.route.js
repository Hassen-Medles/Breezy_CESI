const express = require('express');
const router = express.Router();
const postController = require('../controllers/Post.controller');
//const auth = require('../middlewares/auth');

router.post('/posts', postController.createPost);
//router.post('/posts', auth, postController.createPost);

router.get('/posts', postController.getAllPosts);


//router.get('/posts/user/:userId', auth, postController.getPostsbyUser);

//router.get('/posts/:postId', postController.getPostById);
//router.get('/posts/:postId', auth, postController.getPostById);

//router.put('/posts/:postId', postController.updatePost);
//router.put('/posts/:postId', auth, postController.updatePost);

//router.delete('/posts/:postId', postController.deletePost);
//router.delete('/posts/:postId', auth, postController.deletePost);

module.exports = router;