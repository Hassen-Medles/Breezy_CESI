import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import cookieParser from "cookie-parser";

const router = express.Router();

router.use(cookieParser());

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.AUTH_TOKEN, async (err, decoded) => {
    if (err) return res.sendStatus(401);
    const user = await User.findById(decoded.id || decoded.userId);
    if (!user) {
      console.error("User non trouvé pour l'id :", decoded.id || decoded.userId);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    req.user = user;
    console.log("User trouvé dans middleware:", user);
    next();
  });
}

router.get("/me", authenticateToken, (req, res) => {
  res.json(req.user);
});

export default router;