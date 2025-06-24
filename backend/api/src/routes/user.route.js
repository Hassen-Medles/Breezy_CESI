import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

const router = express.Router();

router.use(cookieParser());

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  console.log('Token reçu:', token);
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.AUTH_TOKEN, async (err, decoded) => {
    if (err) {
      console.error('Erreur JWT verify:', err);
      return res.sendStatus(401);
    }
    const user = await User.findById(decoded.id || decoded.userId);
    if (!user) {
      console.error("User non trouvé pour l'id :", decoded.id || decoded.userId);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    req.user = user;
    console.log("User trouvé dans middleware:", user);
    next();
  });
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

export default router;