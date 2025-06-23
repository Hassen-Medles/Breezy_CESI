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

app.listen(5000, () => {
  console.log("Auth-service running on http://localhost:5000");
});