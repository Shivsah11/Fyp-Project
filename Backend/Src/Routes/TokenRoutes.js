/**
 * @file TokenRoutes.js
 * @description Routes for token-related actions like coin redemption. All routes are protected by auth middleware.
 */

import express from "express";
import { redeemCoins } from "../Controllers/TokenController.js";
import { authenticateToken } from "../Middleware/Auth.js";

const router = express.Router();

// Route to redeem coins for a reward; requires JWT authentication
router.post("/redeem", authenticateToken, redeemCoins);

export default router;
