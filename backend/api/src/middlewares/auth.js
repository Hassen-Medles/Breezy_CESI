import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    console.log('AUTH DEBUG: Pas de cookie token');
    return res.status(401).json({ message: 'Token manquant ou invalide.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.AUTH_TOKEN);
    req.user = decoded;
    console.log('AUTH DEBUG: Utilisateur décodé', decoded);
    next();
  } catch (err) {
    console.error('Erreur dans /profile:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

export default auth;