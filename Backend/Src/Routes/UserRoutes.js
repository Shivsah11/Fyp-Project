/**
 * @file UserRoutes.js
 * @description Express routes for managing authenticated user profiles, preferences, password updates, and account deletion.
 */

import express from "express";
import { 
  getProfile, 
  updateProfile, 
  updatePreferences, 
  changePassword, 
  deleteAccount 
} from "../Controllers/UserController.js";
import { authenticateToken } from "../Middleware/Auth.js";

const router = express.Router();

// Enforce JWT token verification middleware globally across all user routes
router.use(authenticateToken);

// User Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// User Preferences route
router.patch("/preferences", updatePreferences);

// User Security / Account Maintenance routes
router.post("/change-password", changePassword);
router.delete("/account", deleteAccount);

export default router;

