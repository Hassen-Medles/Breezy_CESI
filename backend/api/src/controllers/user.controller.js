import jwt from "jsonwebtoken";
import User from "../models/User.js";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import Follow from "../models/Follow.js";

export function authenticateToken(req, res, next) {
  const token = req.cookies.token;
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

export const getMe = (req, res) => {
  res.json(req.user);
};

export const searchUsers = async (req, res) => {
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
        { _id: { $ne: req.user._id } }
      ]
    }).select("_id username email profilePicture description isPrivate");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la recherche utilisateur." });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("_id username email profilePicture description followers following");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur." });
  }
};

export const updatePrivacy = async (req, res) => {
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
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des notifications." });
  }
};

export const getFollowCounts = async (req, res) => {
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
};

export const logout = (req, res) => {
  res.clearCookie("token", { path: "/", httpOnly: true, sameSite: "lax" });
  res.status(200).json({ message: "Déconnecté" });
};
