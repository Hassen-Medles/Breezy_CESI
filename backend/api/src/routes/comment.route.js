import express from 'express';
import Comment from '../models/Comment.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Créer un commentaire sur un post
router.post('/:postId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.length > 280) {
      return res.status(400).json({ message: 'Le commentaire doit faire entre 1 et 280 caractères.' });
    }
    const comment = new Comment({
      content,
      post: req.params.postId,
      author: req.user.userId || req.user.id,
    });
    await comment.save();
    await comment.populate('author', 'username profilePicture');
    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création du commentaire.' });
  }
});

// Récupérer les commentaires d'un post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commentaires.' });
  }
});

// Supprimer un commentaire (optionnel)
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Commentaire non trouvé.' });
    if (comment.author.toString() !== (req.user.userId || req.user.id)) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }
    await comment.deleteOne();
    res.status(200).json({ message: 'Commentaire supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression du commentaire.' });
  }
});

export default router;