import * as authController from "../controllers/auth.controller.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

export default function(app) {
  app.post("/login", authController.login);
  app.post("/register", upload.single("profilePicture"), authController.register);
  app.post("/verify", authController.verify);
  app.post("/profile", authController.authenticate, upload.single("profilePicture"), authController.completeProfile);
  app.get("/authenticate", authController.authenticate, (req, res) => res.status(200).json({ message: "Authenticated" }));
  app.get("/me", authController.authenticate, authController.getProfile);
}