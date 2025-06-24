import Post from '../models/Post.js';

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
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
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
};

// Récupérer les posts de l'utilisateur connecté via le JWT
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const posts = await Post.find({ author: userId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des posts de l'utilisateur connecté." });
  }
};