import express from "express";
import { redeemCoins } from "../Controllers/TokenController.js";
import { authenticateToken } from "../Middleware/Auth.js";

const router = express.Router();

// All token routes require authentication
router.post("/redeem", authenticateToken, redeemCoins);

export default router;
