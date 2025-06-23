const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Lire le token depuis le cookie httpOnly
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Token manquant ou invalide.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.AUTH_TOKEN);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide.' });
  }
};