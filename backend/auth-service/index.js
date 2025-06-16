import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/models/user.model.js";
import jwt from "jsonwebtoken";
import authRoutes from "./src/routes/auth.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {});

// Monte les routes d'authentification APRÈS la config d'app
authRoutes(app);

// Vérification du code
app.post("/verify", async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email, verificationCode: code });
    if (!user) {
      return res.status(400).json({ message: "Code invalide." });
    }
    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();
    res.json({ message: "Compte vérifié !" });
  } catch (err) {
    console.error("Erreur dans /verify :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

app.listen(5000, () => {
  console.log("Auth-service running on http://localhost:5000");
});