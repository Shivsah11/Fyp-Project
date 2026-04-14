import express from "express";
import { sendMessage, getMessages, markAsRead, deleteMessage, getConversations, getConversationMessages } from "../Controllers/MessageController.js";
import { authenticateToken } from "../Middleware/Auth.js";

const router = express.Router();

// Require token for all message routes
router.use(authenticateToken);

// Get messages for current user
router.get("/", getMessages);

// Get conversations for current user
router.get("/conversations", getConversations);

// Get messages for a specific conversation
router.get("/conversation/:userId", getConversationMessages);

// Send new message
router.post("/", sendMessage);

// Mark as read
router.patch("/:id/read", markAsRead);

// Delete message
router.delete("/:id", deleteMessage);

export default router;
