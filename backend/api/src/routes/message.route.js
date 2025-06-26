import express from "express";
import auth from "../middlewares/auth.js";
import multer from "multer";
import { sendMessage, getLastMessage } from "../controllers/message.controller.js";

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post("/", auth, upload.single('image'), sendMessage);
router.get("/last/:id", auth, getLastMessage);

export default router;