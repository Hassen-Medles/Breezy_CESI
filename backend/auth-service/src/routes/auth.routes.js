import * as authController from "../controllers/auth.controller.js";
import { authenticate, completeProfile } from "../controllers/auth.controller.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import User from "../models/user.model.js";
import cookieParser from "cookie-parser";
import express from "express";

const upload = multer({ dest: "uploads/" });

function authenticateToken(req, res, next) {
    console.log("Appel middleware authenticateToken", req.cookies);
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.AUTH_TOKEN, async (err, decoded) => {
        if (err) return res.sendStatus(401);
        // Log le contenu du token pour debug
        console.log('Decoded JWT:', decoded);
        // Prends en priorité userId, puis id, puis _id
        const userId = decoded.userId || decoded.id || decoded._id;
        if (!userId) return res.status(401).json({ message: "Token sans identifiant utilisateur." });
        const user = await User.findById(userId);
        console.log("User trouvé dans middleware:", user);
        if (!user) return res.sendStatus(404);
        req.user = user;
        next();
    });
}

export default function(app) {
    app.use(cookieParser());
    app.post("/login", authController.login);
    app.post("/register", upload.single("profilePicture"), authController.register);
    app.post("/verify", authController.verify);
    app.post("/profile", authenticateToken, upload.single("profilePicture"), authController.completeProfile);

    // Route protégée par le middleware
    app.get("/authenticate", authenticateToken, (req, res) => {
        return res.status(200).json({ message: "Authenticated" });
    });
    app.get("/profile", authenticateToken, authController.getProfile);
    app.post("/notification", authenticateToken, async (req, res) => {
        // Exemple : créer une notification (à adapter selon ton modèle)
        // const { type, message } = req.body;
        // const notification = new Notification({ type, user: req.user._id, message });
        // await notification.save();
        // res.status(201).json(notification);
        res.status(201).json({ message: "Notification POST OK (à implémenter selon besoin)" });
    });
    app.get("/notification", authenticateToken, (req, res) => {
        res.json({ message: "Notification GET OK" });
    });
    app.get("/accueil", authenticateToken, (req, res) => {
        res.json({ message: "Accueil GET OK" });
    });
    app.get("/recherche", authenticateToken, (req, res) => {
        res.json({ message: "Recherche GET OK" });
    });

    app.use('/uploads', express.static('uploads', {
        // Autorise le partage de fichiers statiques pour le frontend
        setHeaders: (res, path) => {
            res.set('Access-Control-Allow-Origin', '*');
        }
    }));
}
