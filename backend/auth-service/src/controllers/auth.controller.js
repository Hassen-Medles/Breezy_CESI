import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

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

    console.log("Données reçues dans /register :", req.body, req.file);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà existant" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    console.log("Code de vérification généré :", verificationCode);
    // Crée l'utilisateur d'abord
    const newUser = new User({
      email,
      password: hashedPassword,
      verificationCode,
      isVerified: false,
      username: email, // ou `${email}-${Date.now()}`
      description: undefined,
      profilePicture,
    });

    await newUser.save();

    console.log("Nouvel utilisateur créé :", newUser);
    // Génère le token avec newUser
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.AUTH_TOKEN,
      { expiresIn: "1h" }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });

    // Log avant l'envoi du mail
    console.log("Tentative d'envoi de mail à", newUser.email, "depuis", process.env.EMAIL_USER);
    // Envoie le mail
    await transporter.sendMail({
      from: `"Breezy Auth" <${process.env.EMAIL_USER}>`,
      to: newUser.email,
      subject: "Votre code de vérification",
      html: `<p>Votre code de vérification est : <b>${verificationCode}</b></p>`
    });
    console.log("Mail envoyé !");

    return res.status(201).json({ message: "New User created! Vérifiez votre email."});
  } catch (err) {
    console.error("Erreur dans /register :", err, err && err.stack);
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
  await transporter.sendMail({
    from: `"Breezy Auth" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Votre compte Breezy est activé !",
    html: `<p>Bienvenue sur Breezy, votre compte est maintenant activé !</p>`
  });
  console.log("Mail de confirmation de création de compte envoyé !");

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.AUTH_TOKEN,
    { expiresIn: "1h" }
  );
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
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
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });
  res.json({ message: "Connexion réussie !" });
  } catch (err) {
    console.error("Erreur dans /login :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const authenticate = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  jwt.verify(token, process.env.AUTH_TOKEN, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(decoded.id || decoded.userId);
    if (!user) return res.sendStatus(404);
      console.log("User trouvé dans middleware:", user);
      req.user = user;
    next();
  });
};

export const completeProfile = async (req, res) => {
  try {
    const { username, description, email } = req.body;
    const profilePicture = req.file ? req.file.filename : null;
    let user = null;

    // Trouver l'utilisateur par token ou email
    console.log('DEBUG completeProfile req.user:', req.user);
    console.log('DEBUG completeProfile req.body.email:', email);
    if (req.user?._id) {
      user = await User.findById(req.user._id);
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      if (!req.user && !email) {
        return res.status(400).json({ message: "Aucune information d'identification fournie (ni token, ni email)." });
      } else if (email) {
        return res.status(404).json({ message: `Aucun utilisateur trouvé avec l'email ${email}.` });
      } else {
        return res.status(404).json({ message: "Utilisateur non trouvé via le token. Veuillez vous reconnecter." });
      }
    }

    // Vérifier que le username n'est pas déjà pris par un autre utilisateur
    if (username) {
      const existing = await User.findOne({ username });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Ce nom d'utilisateur est déjà utilisé, veuillez en choisir un autre." });
      }
      user.username = username;
    }
    if (description !== undefined) user.description = description;
    if (profilePicture) user.profilePicture = profilePicture;
    await user.save();

    res.json({ message: "Profil mis à jour !", user });
  } catch (err) {
    console.error("Erreur dans completeProfile :", err, err && err.stack);
    res.status(500).json({ message: "Erreur lors de la complétion du profil." });
  }
};

export const getProfile = async (req, res) => {
  // req.user est injecté par authenticateToken
  if (!req.user) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  // On ne retourne que les infos publiques
  const { _id, email, username, description, profilePicture, isVerified } = req.user;
  return res.status(200).json({
    _id,
    email,
    username,
    description,
    profilePicture,
    isVerified
  });
};