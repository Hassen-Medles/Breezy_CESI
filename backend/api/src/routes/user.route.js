import express from "express";
import cookieParser from "cookie-parser";
import {
  authenticateToken,
  getMe,
  searchUsers,
  getUserById,
  updatePrivacy,
  getNotifications,
  getFollowCounts,
  logout
} from "../controllers/user.controller.js";
import Post from "../models/Post.js";

const router = express.Router();
router.use(cookieParser());

router.get("/me", authenticateToken, getMe);
router.get("/search", authenticateToken, searchUsers);
router.get("/:id", getUserById);
router.patch("/privacy", authenticateToken, updatePrivacy);
router.get("/notification", authenticateToken, getNotifications);
router.get("/:id/follow-counts", getFollowCounts);
router.post("/logout", logout);

// Nouvelle route : récupérer les posts d'un utilisateur
router.get("/:id/posts", async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;