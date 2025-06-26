import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/models/user.model.js";
import jwt from "jsonwebtoken";
import authRoutes from "./src/routes/auth.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Important pour cookies derrière nginx/proxy
app.use(cors({
  origin: (origin, callback) => {
    // Autorise localhost:8080, localhost:3000, et tout sous-réseau 10.116.128.*
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost:8080') ||
      origin.startsWith('http://localhost:3000') ||
      /^http:\/\/10\.116\.128\.[0-9]+(:[0-9]+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {});

app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
// Monte les routes d'authentification APRÈS la config d'app
authRoutes(app);

app.listen(5000, () => {
  console.log("Auth-service running on http://localhost:5000");
});