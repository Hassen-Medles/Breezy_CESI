import express from "express";
import Conversation from "../models/Conversation.js";
import Follow from "../models/Follow.js";
import auth from "../middlewares/auth.js";
import mongoose from "mongoose";
import Message from "../models/Message.js";

const router = express.Router();

// Récupérer ou créer la conversation entre l'utilisateur connecté et userId
router.get("/with/:userId", auth, async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.userId);
  const otherId = new mongoose.Types.ObjectId(req.params.userId);

  const iFollow = await Follow.findOne({ follower: userId, followed: otherId });
  const theyFollow = await Follow.findOne({ follower: otherId, followed: userId });

  if (!iFollow || !theyFollow) {
    return res.status(403).json({
      message: "Vous devez être abonnés mutuellement pour discuter en privé.",
      debug: {
        userId: userId?.toString(),
        otherId: otherId?.toString(),
        iFollow: !!iFollow,
        theyFollow: !!theyFollow
      }
    });
  }

  let conv = await Conversation.findOne({
    participants: { $all: [userId, otherId], $size: 2 }
  });
  if (!conv) {
    conv = await Conversation.create({ participants: [userId, otherId] });
  }
  res.json(conv);
});

// Récupérer une conversation par son id
router.get("/:id", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate('participants', 'username profilePicture');
    if (!conversation) return res.status(404).json({ message: "Conversation non trouvée" });

    const messages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .populate('sender', 'username profilePicture'); // Ajout du populate pour le sender
    // Optionnel : déterminer l'autre utilisateur
    const me = req.user.userId;
    const otherUser = conversation.participants.find(
        u => u && u._id && u._id.toString() !== me
    );

    res.json({
      conversation: {
        ...conversation.toObject(),
        me,
        otherUser
      },
      messages: messages.map(msg => ({
        ...msg.toObject(),
        senderProfilePicture: msg.sender?.profilePicture || null,
        senderUsername: msg.sender?.username || null
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;