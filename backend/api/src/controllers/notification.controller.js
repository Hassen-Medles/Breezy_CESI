import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const notifications = await Notification.find({ user: userId })
      .populate('liker', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications.' });
  }
};
