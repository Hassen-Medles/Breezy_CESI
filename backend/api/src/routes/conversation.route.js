import express from "express";
import auth from "../middlewares/auth.js";
import { getOrCreateConversation, getConversationById } from "../controllers/conversation.controller.js";

const router = express.Router();

// Récupérer ou créer la conversation entre l'utilisateur connecté et userId
router.get("/with/:userId", auth, getOrCreateConversation);

// Récupérer une conversation par son id
router.get("/:id", auth, getConversationById);

export default router;