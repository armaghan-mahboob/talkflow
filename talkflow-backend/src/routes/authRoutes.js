import express from "express";

import {
  sendOtp,
  verifyOtp,
  createUser,
  updatePublicKey,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", createUser);
router.post("/update-public-key", updatePublicKey);

export default router;
