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
  try {
    const { email, password } = req.body;
    const profilePicture = req.file ? req.file.filename : null;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà existant" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    // Crée l'utilisateur d'abord
    const newUser = new User({
      email,
      password: hashedPassword,
      verificationCode,
      isVerified: false,
      // description et profilePicture peuvent être undefined ici
      description: undefined,
      profilePicture,
    });

    await newUser.save();

    // Génère le token avec newUser
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
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

    return res.status(201).json({ message: "New User created! Vérifiez votre email."});
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
  user.verificationCode = undefined;
  await user.save();

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.AUTH_TOKEN,
    { expiresIn: "1h" }
  );
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });
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

    res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });
  res.json({ message: "Connexion réussie !" });
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

export const completeProfile = async (req, res) => {
  try {
    const { username, description } = req.body;
    const profilePicture = req.file ? req.file.filename : null;
    const userId = req.user.id;

    if (!username) {
      return res.status(400).json({ message: "Le nom d'utilisateur est obligatoire." });
    }

    const existing = await User.findOne({ username });
    if (existing && existing._id.toString() !== userId) {
      return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris." });
    }

    const updateFields = { username, description };
    if (profilePicture) updateFields.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(userId, updateFields, { new: true });

    // Envoi du mail de bienvenue après complétion du profil
    await transporter.sendMail({
      from: `"Breezy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Bienvenue sur Breezy !",
      html: `<p>Votre compte est maintenant complet. Bienvenue !</p>`,
    });

    res.json({ message: "Profil mis à jour !" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la complétion du profil." });
  }
};