import express from "express";
import mongoose from "mongoose";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import Follow from "../models/Follow.js";
import Notification from "../models/Notification.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const router = express.Router();
router.use(cookieParser());

function authenticateToken(req, res, next) {
  // Récupère le cookie d'authentification
  const token = req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ message: "Aucun token d'authentification trouvé dans les cookies." });
  try {
    const decoded = jwt.verify(token, process.env.AUTH_TOKEN);
    console.log('Decoded JWT:', decoded);
    const userId = decoded.userId || decoded.id || decoded._id;
    if (!userId) return res.status(401).json({ message: "Token sans identifiant utilisateur." });
    // Vérifie l'existence de l'utilisateur en base
    User.findById(userId).then(user => {
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
      req.user = user;
      req.user._id = user._id.toString();
      next();
    }).catch((err) => {
      console.error('Erreur lors de la recherche utilisateur:', err);
      res.status(401).json({ message: "Erreur lors de la vérification de l'utilisateur." });
    });
  } catch (e) {
    console.error('Erreur de vérification du token:', e);
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
}

// Envoyer une demande d'ami ou suivre directement si public
router.post("/request", authenticateToken, async (req, res) => {
  const { toUserId } = req.body;
  let fromUserId = req.user._id;
  let toId = toUserId;
  if (!mongoose.Types.ObjectId.isValid(fromUserId)) return res.status(400).json({ message: "ID utilisateur connecté invalide." });
  if (!mongoose.Types.ObjectId.isValid(toId)) return res.status(400).json({ message: "ID utilisateur cible invalide." });
  fromUserId = new mongoose.Types.ObjectId(fromUserId);
  toId = new mongoose.Types.ObjectId(toId);
  if (fromUserId.equals(toId)) return res.status(400).json({ message: "Impossible de s'auto-suivre." });
  const target = await User.findById(toId);
  if (!target) return res.status(404).json({ message: "Utilisateur cible introuvable." });
  if (target.isPrivate) {
    // Demande d'ami
    const already = await FriendRequest.findOne({ from: fromUserId, to: toId, status: 'pending' });
    if (already) return res.status(400).json({ message: "Demande déjà envoyée." });
    await FriendRequest.create({ from: fromUserId, to: toId });
    // Création de la notification
    await Notification.create({
      type: 'system',
      user: toId,
      message: `${req.user.username || 'Un utilisateur'} vous a envoyé une demande d'ami.`
    });
    return res.json({ message: "Demande envoyée (en attente d'acceptation)." });
  } else {
    // Suivi direct
    const already = await Follow.findOne({ follower: fromUserId, followed: toId });
    if (already) return res.status(400).json({ message: "Déjà abonné." });
    await Follow.create({ follower: fromUserId, followed: toId });
    // Création de la notification pour le suivi direct
    await Notification.create({
      type: 'follow',
      user: toId,
      message: `${req.user.username || 'Un utilisateur'} a commencé à vous suivre.`
    });
    return res.json({ message: "Vous suivez maintenant cet utilisateur." });
  }
});

// Accepter une demande d'ami
router.post("/accept", authenticateToken, async (req, res) => {
  const { requestId } = req.body;
  const request = await FriendRequest.findById(requestId);
  if (!request || request.to.toString() !== req.user.id || request.status !== 'pending') {
    return res.status(400).json({ message: "Demande invalide." });
  }
  request.status = 'accepted';
  await request.save();
  await Follow.create({ follower: request.from, followed: request.to });
  res.json({ message: "Demande acceptée." });
});

// Refuser une demande d'ami
router.post("/decline", authenticateToken, async (req, res) => {
  const { requestId } = req.body;
  const request = await FriendRequest.findById(requestId);
  if (!request || request.to.toString() !== req.user.id || request.status !== 'pending') {
    return res.status(400).json({ message: "Demande invalide." });
  }
  request.status = 'declined';
  await request.save();
  res.json({ message: "Demande refusée." });
});

// Voir les demandes reçues
router.get("/received", authenticateToken, async (req, res) => {
  let toUserId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(toUserId)) return res.json([]);
  toUserId = new mongoose.Types.ObjectId(toUserId);
  const requests = await FriendRequest.find({ to: toUserId, status: 'pending' }).populate('from', 'username profilePicture');
  res.json(requests);
});

// Voir les demandes envoyées
router.get("/sent", authenticateToken, async (req, res) => {
  let fromUserId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(fromUserId)) return res.json([]);
  fromUserId = new mongoose.Types.ObjectId(fromUserId);
  const requests = await FriendRequest.find({ from: fromUserId, status: 'pending' }).populate('to', 'username profilePicture');
  res.json(requests);
});

// Se désabonner (unfollow) d'un utilisateur
router.post("/unfollow", authenticateToken, async (req, res) => {
  const { toUserId } = req.body;
  let fromUserId = req.user._id;
  let toId = toUserId;
  if (!toUserId) return res.status(400).json({ message: "ID utilisateur cible manquant." });
  if (!mongoose.Types.ObjectId.isValid(fromUserId) || !mongoose.Types.ObjectId.isValid(toId)) {
    return res.status(400).json({ message: "ID utilisateur invalide." });
  }
  fromUserId = new mongoose.Types.ObjectId(fromUserId);
  toId = new mongoose.Types.ObjectId(toId);
  const follow = await Follow.findOneAndDelete({ follower: fromUserId, followed: toId });
  if (!follow) return res.status(400).json({ message: "Vous ne suivez pas cet utilisateur." });
  res.json({ message: "Vous ne suivez plus cet utilisateur." });
});

// Vérifier si on suit déjà ou si une demande est en attente
router.get("/following/:userId", authenticateToken, async (req, res) => {
  let followerId = req.user._id;
  let userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.json({ following: false, pending: false });
  }
  followerId = new mongoose.Types.ObjectId(followerId);
  userId = new mongoose.Types.ObjectId(userId);
  const follow = await Follow.findOne({ follower: followerId, followed: userId });
  if (follow) return res.json({ following: true, pending: false });
  const pending = await FriendRequest.findOne({ from: followerId, to: userId, status: 'pending' });
  if (pending) return res.json({ following: false, pending: true });
  res.json({ following: false, pending: false });
});

export default router;
