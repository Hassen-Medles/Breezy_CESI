import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: false, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationCode: { type: String },      // Code à 6 chiffres envoyé par email
  isVerified: { type: Boolean, default: false }, // Statut de vérification
  description: { type: String },
  profilePicture: { type: String },
  isPrivate: { type: Boolean, default: true }, // Compte privé par défaut
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Rôle de l'utilisateur
});

const User = mongoose.model('User', userSchema);
export default User;