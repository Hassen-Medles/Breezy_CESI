import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
// Sert les fichiers uploadés (images de profil)
app.use('/uploads', express.static('uploads'));

authRoutes(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Auth-service lancé sur le port ${PORT}`);
});
