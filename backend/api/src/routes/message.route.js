import express from "express";
import Message from "../models/Message.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/last/:id", auth, async (req, res) => {
  try {
    const lastMessage = await Message.findOne({ conversation: req.params.id })
      .sort({ createdAt: -1 });
    // Si aucun message, renvoyer null au lieu d'une erreur
    res.json(lastMessage || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { conversationId, content, receiver } = req.body;
    if (!conversationId || !content || !receiver) {
      return res.status(400).json({ message: "conversationId, content et receiver requis" });
    }
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.userId,
      receiver: receiver,
      content,
      createdAt: new Date()
    });
    res.status(201).json(message);
  } catch (err) {
    console.error("Erreur POST /api/messages :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;