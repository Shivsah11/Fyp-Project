import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Config/Db.js";
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

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Global request logger for debugging connection issues
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Routes
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
