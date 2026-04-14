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

// All user routes require authentication
router.use(authenticateToken);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.patch("/preferences", updatePreferences);
router.post("/change-password", changePassword);
router.delete("/account", deleteAccount);

export default router;
