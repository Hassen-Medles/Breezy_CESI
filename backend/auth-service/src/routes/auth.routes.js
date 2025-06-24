import * as authController from "../controllers/auth.controller.js";
import { authenticate, completeProfile } from "../controllers/auth.controller.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import User from "../models/user.model.js";
import cookieParser from "cookie-parser";

const upload = multer({ dest: "uploads/" });

function authenticateToken(req, res, next) {
    console.log("Appel middleware authenticateToken", req.cookies);
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.AUTH_TOKEN, async (err, decoded) => {
        if (err) return res.sendStatus(401);
        const user = await User.findById(decoded.id || decoded.userId);
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
}
