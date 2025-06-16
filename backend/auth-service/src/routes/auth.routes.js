import * as authController from "../controllers/auth.controller.js";
import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.AUTH_TOKEN, (err, user) => {
        if (err) return res.sendStatus(401);
        req.user = user;
        next();
    });
}

export default function(app) {
    app.post("/login", authController.login);
    app.post("/register", authController.register);

    // Route protégée par le middleware
    app.get("/authenticate", authenticateToken, (req, res) => {
        return res.status(200).json({ message: "Authenticated" });
    });
}