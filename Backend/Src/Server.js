import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Config/Db.js";
import authRoutes from "./Routes/AuthRoutes.js";
import dashboardRoutes from "./Routes/DashboardRoutes.js";
import deleteRoutes from "./Routes/DeleteRoutes.js";
import userRoutes from "./Routes/UserRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/delete", deleteRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
