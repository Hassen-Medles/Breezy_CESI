const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middlewares/auth');

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

// (Optionnel) Supprimer un commentaire
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Commentaire non trouvé.' });
    // Optionnel : vérifier que l'utilisateur est bien l'auteur
    if ((comment.author.toString() !== (req.user.userId || req.user.id))) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }
    await comment.deleteOne();
    res.status(200).json({ message: 'Commentaire supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression du commentaire.' });
  }
});

module.exports = router;