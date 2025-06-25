import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import Follow from "../models/Follow.js";

const router = express.Router();

router.use(cookieParser());

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  console.log('Token reçu:', token);
  if (!token) return res.sendStatus(401);
  try {
    const decoded = jwt.verify(token, process.env.AUTH_TOKEN);
    User.findById(decoded.userId || decoded.id || decoded._id)
      .then(user => {
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
        req.user = user;
        next();
      })
      .catch(() => res.sendStatus(401));
  } catch (e) {
    return res.sendStatus(401);
  }
}

router.get("/me", authenticateToken, (req, res) => {
  res.json(req.user);
});

// Route de recherche utilisateur par préfixe (username ou email)
router.get("/search", authenticateToken, async (req, res) => {
  const query = req.query.query || "";
  if (!query) return res.json([]);
  try {
    const regex = new RegExp("^" + query, "i");
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: regex } },
            { email: { $regex: regex } }
          ]
        },
        { _id: { $ne: req.user._id } } // Correction : exclusion simple
      ]
    }).select("_id username email profilePicture description isPrivate");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la recherche utilisateur." });
  }
});

// Route publique pour obtenir les infos d'un utilisateur par son id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("_id username email profilePicture description followers following");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur." });
  }
});

// Route pour changer la visibilité du compte (public/privé)
router.patch("/privacy", authenticateToken, async (req, res) => {
  try {
    const { isPrivate } = req.body;
    if (typeof isPrivate !== "boolean") {
      return res.status(400).json({ message: "Valeur de confidentialité invalide." });
    }
    req.user.isPrivate = isPrivate;
    await req.user.save();
    res.json({ message: `Compte mis à jour en mode ${isPrivate ? "privé" : "public"}.`, isPrivate });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de la confidentialité." });
  }
});

// Récupérer les notifications de l'utilisateur connecté
router.get("/notification", authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des notifications." });
  }
});

// Route pour obtenir le nombre d'abonnés et d'abonnements d'un utilisateur
router.get("/:id/follow-counts", async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide." });
    }
    const followers = await Follow.countDocuments({ followed: userId });
    const following = await Follow.countDocuments({ follower: userId });
    res.json({ followers, following });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du comptage des abonnés/abonnements." });
  }
});

export default router;