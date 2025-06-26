import express from "express";
import cookieParser from "cookie-parser";
import {
  authenticateToken,
  getMe,
  searchUsers,
  getUserById,
  updatePrivacy,
  getNotifications,
  getFollowCounts,
  logout
} from "../controllers/user.controller.js";

const router = express.Router();
router.use(cookieParser());

router.get("/me", authenticateToken, getMe);
router.get("/search", authenticateToken, searchUsers);
router.get("/:id", getUserById);
router.patch("/privacy", authenticateToken, updatePrivacy);
router.get("/notification", authenticateToken, getNotifications);
router.get("/:id/follow-counts", getFollowCounts);
router.post("/logout", logout);

export default router;