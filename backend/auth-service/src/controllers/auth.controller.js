import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import nodemailer from "nodemailer";

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
    tls: {
    rejectUnauthorized: false
  }
});

export const register = async (req, res) => {
  console.log("Requête reçue sur /register :", req.body);
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email ou username déjà existant" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const token = jwt.sign(
      { username, email },
      process.env.AUTH_TOKEN,
      { expiresIn: "1h" }
    );

    // Envoie le mail
    await transporter.sendMail({
      from: `"Breezy Auth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Votre code de vérification",
      html: `<p>Votre code de vérification est : <b>${verificationCode}</b></p>`
    });

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      jwt: token,
      verificationCode,
      isVerified: false,
    });

    await newUser.save();
    return res.status(201).json({ message: "New User created! Vérifiez votre email.", token });
  } catch (err) {
    console.error("Erreur dans /register :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const verify = async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email, verificationCode: code });
  if (!user) {
    return res.status(400).json({ message: "Code incorrect ou expiré." });
  }
  user.isVerified = true;
  user.verificationCode = undefined; // Optionnel : supprime le code après vérification
  await user.save();
  res.status(201).json({ message: "Compte vérifié !" });
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.username }
      ]
    });
    if (!user) return res.status(400).json({ message: "Utilisateur inconnu." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Mot de passe incorrect." });

    // Génère le JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.AUTH_TOKEN,
      { expiresIn: "1h" }
    );

    // Enregistre le JWT dans le user
    user.jwt = token;
    await user.save();

    res.json({ message: "Connexion réussie !", token });
  } catch (err) {
    console.error("Erreur dans /login :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const authenticate = async (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  let TOKEN = token.split(" ")[1];

  jwt.verify(TOKEN, process.env.AUTH_TOKEN, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Vérifie que l'utilisateur existe toujours
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user; // Optionnel : attache l'utilisateur à la requête
    next();
    //return res.status(200).json({ message: "Authenticated", user: user });
  });
}