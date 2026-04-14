import express from "express";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  clearNotifications 
} from "../Controllers/NotificationController.js";
import { authenticateToken } from "../Middleware/Auth.js";

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.delete("/", clearNotifications);

export default router;
