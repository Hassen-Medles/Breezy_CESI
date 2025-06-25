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
app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:3000"],
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