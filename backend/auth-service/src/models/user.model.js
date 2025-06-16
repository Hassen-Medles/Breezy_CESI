import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  jwt: { type: String }, // Token JWT pour l'authentification
  verificationCode: { type: String },      // Code à 6 chiffres envoyé par email
  isVerified: { type: Boolean, default: false } // Statut de vérification
});

export default mongoose.model("User", userSchema);