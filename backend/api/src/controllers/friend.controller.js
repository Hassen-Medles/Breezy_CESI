import mongoose from "mongoose";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import Follow from "../models/Follow.js";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const token = req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ message: "Aucun token d'authentification trouvé dans les cookies." });
  try {
    const decoded = jwt.verify(token, process.env.AUTH_TOKEN);
    const userId = decoded.userId || decoded.id || decoded._id;
    if (!userId) return res.status(401).json({ message: "Token sans identifiant utilisateur." });
    User.findById(userId).then(user => {
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
      req.user = user;
      req.user._id = user._id.toString();
      next();
    }).catch((err) => {
      res.status(401).json({ message: "Erreur lors de la vérification de l'utilisateur." });
    });
  } catch (e) {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
}

export const isFollower = async (req, res) => {
  const myId = req.user._id;
  const otherId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(myId) || !mongoose.Types.ObjectId.isValid(otherId)) {
    return res.json({ following: false });
  }
  const follow = await Follow.findOne({ follower: otherId, followed: myId });
  res.json({ following: !!follow });
};

export const sendFriendRequest = async (req, res) => {
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
    const already = await FriendRequest.findOne({ from: fromUserId, to: toId, status: 'pending' });
    if (already) return res.status(400).json({ message: "Demande déjà envoyée." });
    await FriendRequest.create({ from: fromUserId, to: toId });
    await Notification.create({
      type: 'system',
      user: toId,
      message: `${req.user.username || 'Un utilisateur'} vous a envoyé une demande d'ami.`
    });
    return res.json({ message: "Demande envoyée (en attente d'acceptation)." });
  } else {
    const already = await Follow.findOne({ follower: fromUserId, followed: toId });
    if (already) return res.status(400).json({ message: "Déjà abonné." });
    await Follow.create({ follower: fromUserId, followed: toId });
    await Notification.create({
      type: 'follow',
      user: toId,
      message: `${req.user.username || 'Un utilisateur'} a commencé à vous suivre.`
    });
    return res.json({ message: "Vous suivez maintenant cet utilisateur." });
  }
};

export const acceptFriendRequest = async (req, res) => {
  const { requestId } = req.body;
  const request = await FriendRequest.findById(requestId);
  if (!request || request.to.toString() !== req.user.id || request.status !== 'pending') {
    return res.status(400).json({ message: "Demande invalide." });
  }
  request.status = 'accepted';
  await request.save();
  await Follow.create({ follower: request.from, followed: request.to });
  res.json({ message: "Demande acceptée." });
};

export const declineFriendRequest = async (req, res) => {
  const { requestId } = req.body;
  const request = await FriendRequest.findById(requestId);
  if (!request || request.to.toString() !== req.user.id || request.status !== 'pending') {
    return res.status(400).json({ message: "Demande invalide." });
  }
  request.status = 'declined';
  await request.save();
  res.json({ message: "Demande refusée." });
};

export const getReceivedRequests = async (req, res) => {
  let toUserId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(toUserId)) return res.json([]);
  toUserId = new mongoose.Types.ObjectId(toUserId);
  const requests = await FriendRequest.find({ to: toUserId, status: 'pending' }).populate('from', 'username profilePicture');
  res.json(requests);
};

export const getSentRequests = async (req, res) => {
  let fromUserId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(fromUserId)) return res.json([]);
  fromUserId = new mongoose.Types.ObjectId(fromUserId);
  const requests = await FriendRequest.find({ from: fromUserId, status: 'pending' }).populate('to', 'username profilePicture');
  res.json(requests);
};

export const unfollowUser = async (req, res) => {
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
};

export const checkFollowingOrPending = async (req, res) => {
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
};

export const getFollowingList = async (req, res) => {
  try {
    const follows = await Follow.find({ follower: req.user._id }).populate("followed", "username profilePicture");
    res.json(follows.map(f => f.followed));
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des suivis." });
  }
};
