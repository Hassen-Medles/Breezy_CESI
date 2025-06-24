import express from 'express';
const router = express.Router();
import * as postController from '../controllers/Post.controller.js';
import auth from '../middlewares/auth.js';

//router.post('/posts', postController.createPost);
router.post('/posts', auth, postController.createPost);

router.get('/posts', postController.getAllPosts);

//router.get('/posts/user/:userId', auth, postController.getPostsbyUser);
router.get('/posts/user/me', auth, postController.getMyPosts);

router.get('/posts/:postId', postController.getPostById);
//router.get('/posts/:postId', auth, postController.getPostById);

router.put('/posts/:postId', auth, postController.updatePost);

//router.delete('/posts/:postId', postController.deletePost);
//router.delete('/posts/:postId', auth, postController.deletePost);

export default router;