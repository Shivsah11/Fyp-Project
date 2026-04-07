import express from "express";
import { sendMessage, getMessages, markAsRead, deleteMessage } from "../Controllers/MessageController.js";
import { authenticateToken } from "../Middleware/Auth.js";

const router = express.Router();

// Require token for all message routes
router.use(authenticateToken);

// Get messages for current user
router.get("/", getMessages);

// Send new message
router.post("/", sendMessage);

// Mark as read
router.patch("/:id/read", markAsRead);

// Delete message
router.delete("/:id", deleteMessage);

export default router;
