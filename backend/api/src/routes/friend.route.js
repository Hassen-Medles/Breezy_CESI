import express from "express";
import cookieParser from "cookie-parser";
import {
  authenticateToken,
  isFollower,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getReceivedRequests,
  getSentRequests,
  unfollowUser,
  checkFollowingOrPending,
  getFollowingList
} from "../controllers/friend.controller.js";

const router = express.Router();
router.use(cookieParser());

router.get("/isfollower/:userId", authenticateToken, isFollower);
router.post("/request", authenticateToken, sendFriendRequest);
router.post("/accept", authenticateToken, acceptFriendRequest);
router.post("/decline", authenticateToken, declineFriendRequest);
router.get("/received", authenticateToken, getReceivedRequests);
router.get("/sent", authenticateToken, getSentRequests);
router.post("/unfollow", authenticateToken, unfollowUser);
router.get("/following/:userId", authenticateToken, checkFollowingOrPending);
router.get("/following", authenticateToken, getFollowingList);

export default router;
