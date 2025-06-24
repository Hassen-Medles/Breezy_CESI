import Post from '../models/Post.js';
import Like from '../models/Like.js';

export async function createPost(req, res) {
  try {
    const { content } = req.body;
    if (!content || content.length > 280) {
      return res.status(400).json({ message: 'Le message doit faire entre 1 et 280 caractères.' });
    }
    const post = new Post({
      content,
      author: req.user.userId || req.user.id
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la publication.' });
  }
}

export async function getAllPosts(req, res) {
  try {
    const posts = await Post.find()
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des posts.' });
  }
}

export async function getPostsbyUser(req, res) {
  try {
    const userId = req.params.userId;
    // if (req.user.id !== userId && req.user.role !== 'admin') { ... } // <-- à ajouter avec auth
    const posts = await Post.find({ author: userId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des posts de l\'utilisateur.' });
  }
}

export async function getPostById(req, res) {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé.' });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération du post.' });
  }
}

export async function updatePost(req, res) {
  try {
    const postId = req.params.postId;
    const { content } = req.body;
    if (!content || content.length > 280) {
      return res.status(400).json({ message: 'Le message doit faire entre 1 et 280 caractères.' });
    }
    // const post = await Post.findById(postId);
    // if (req.user.id !== post.author && req.user.role !== 'admin') { ... } // <-- à ajouter avec auth
    const post = await Post.findByIdAndUpdate(postId, { content }, { new: true });
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé.' });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du post.' });
  }
}

export async function deletePost(req, res) {
  try {
    const postId = req.params.postId;
    // const post = await Post.findById(postId);
    // if (req.user.id !== post.author && req.user.role !== 'admin') { ... } // <-- à ajouter avec auth
    const post = await Post.findByIdAndUpdate(postId, { deleted: true }, { new: true });
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé.' });
    }
    res.status(200).json({ message: 'Post supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression du post.' });
  }
}

// Récupérer les posts de l'utilisateur connecté via le JWT
export async function getMyPosts(req, res) {
  try {
    // On vérifie que req.user existe et contient un id
    const user = req.user;
    const userId = user && (user.userId || user.id || user._id);
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié (userId manquant).' });
    }
    // Recherche des posts de l'utilisateur
    const posts = await Post.find({ author: userId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ message: "Erreur lors de la récupération des posts de l'utilisateur connecté.", error: err.message });
  }
}

// Liker un post
export async function likePost(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const postId = req.params.postId;
    // Vérifie si déjà liké
    const existing = await Like.findOne({ user: userId, post: postId });
    if (existing) {
      return res.status(400).json({ message: 'Déjà liké.' });
    }
    await Like.create({ user: userId, post: postId });
    res.status(201).json({ message: 'Post liké.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du like.' });
  }
}

// Unliker un post
export async function unlikePost(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const postId = req.params.postId;
    const deleted = await Like.findOneAndDelete({ user: userId, post: postId });
    if (!deleted) {
      return res.status(400).json({ message: 'Pas encore liké.' });
    }
    res.status(200).json({ message: 'Like retiré.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du unlike.' });
  }
}

// Récupérer le nombre de likes et si l'utilisateur a liké
export async function getLikes(req, res) {
  try {
    const postId = req.params.postId;
    const userId = req.user?.userId || req.user?.id;
    const count = await Like.countDocuments({ post: postId });
    let liked = false;
    if (userId) {
      liked = !!(await Like.findOne({ post: postId, user: userId }));
    }
    res.status(200).json({ count, liked });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des likes.' });
  }
}