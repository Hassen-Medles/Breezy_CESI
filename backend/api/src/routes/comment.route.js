import express from 'express';
import auth from '../middlewares/auth.js';
import {
  createComment,
  getCommentsByPost,
  deleteComment
} from '../controllers/comment.controller.js';

const router = express.Router();

// Créer un commentaire sur un post
router.post('/:postId', auth, createComment);

// Récupérer les commentaires d'un post
router.get('/post/:postId', getCommentsByPost);

// Supprimer un commentaire (optionnel)
router.delete('/:commentId', auth, deleteComment);

export default router;