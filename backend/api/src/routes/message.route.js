import express from "express";
import Message from "../models/Message.js";
import auth from "../middlewares/auth.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post("/", auth, upload.single('image'), async (req, res) => {
  try {
    const { conversationId, content, receiver } = req.body;
    if (!conversationId || (!content && !req.file) || !receiver) {
      return res.status(400).json({ message: "conversationId, content ou image et receiver requis" });
    }
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.filename;
    }
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.userId,
      receiver: receiver,
      content,
      image: imageUrl,
      createdAt: new Date()
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'envoi du message" });
  }
});

router.get("/last/:id", auth, async (req, res) => {
  try {
    const lastMessage = await Message.findOne({ conversation: req.params.id })
      .sort({ createdAt: -1 });
    res.json(lastMessage || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;