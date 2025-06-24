import express from 'express';
import * as postController from '../controllers/Post.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Création d'un post (protégée)
router.post('/posts', auth, postController.createPost);
// Récupérer tous les posts (public)
router.get('/posts', postController.getAllPosts);
// Récupérer les posts d'un utilisateur (protégée)
router.get('/posts/user/:userId', auth, postController.getPostsbyUser);
// Récupérer un post par son id (public)
router.get('/posts/:postId', postController.getPostById);
// Modifier un post (protégée)
router.put('/posts/:postId', auth, postController.updatePost);
// Supprimer un post (protégée)
router.delete('/posts/:postId', auth, postController.deletePost);

export default router;