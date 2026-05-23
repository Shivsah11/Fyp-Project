/**
 * @file Server.js
 * @description Main entry point for the Backend application. Sets up the Express server, 
 * configures global middleware, connects to the database, and registers API routes.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Config/Db.js";

// Import all endpoint route handlers
import authRoutes from "./Routes/AuthRoutes.js";
import dashboardRoutes from "./Routes/DashboardRoutes.js";
import deleteRoutes from "./Routes/DeleteRoutes.js";
import userRoutes from "./Routes/UserRoutes.js";
import adminRoutes from "./Routes/AdminRoutes.js";
import bookingRoutes from "./Routes/BookingRoutes.js";
import propertyRoutes from "./Routes/PropertyRoutes.js";
import messageRoutes from "./Routes/MessageRoutes.js";
import paymentRoutes from "./Routes/PaymentRoutes.js";
import notificationRoutes from "./Routes/NotificationRoutes.js";
import tokenRoutes from "./Routes/TokenRoutes.js";

// Load environment variables from .env file
dotenv.config();

// Establish connection to MongoDB Database
connectDB();

// Initialize the Express application
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from frontend applications
app.use(cors());

// Parse incoming requests with JSON payloads (extended limit for handling large payloads like base64 images)
app.use(express.json({ limit: "50mb" }));

// Parse URL-encoded payloads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Global request logger middleware for debugging connection and routing issues
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Register api route handlers with prefix paths
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/delete", deleteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/tokens", tokenRoutes);

// Health check endpoint to verify server status
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running", timestamp: new Date().toISOString() });
});

// Configure and start server listening on designated port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

