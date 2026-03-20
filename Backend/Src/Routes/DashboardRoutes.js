import express from "express";
import { getDashboardData } from "../Controllers/DashboardController.js";
import { authenticateToken, authorizeRoles } from "../Middleware/Auth.js";

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Get dashboard data - accessible by both Tenant and Landlord
router.get("/", getDashboardData);

// Example of a role-protected route (only for landlords)
// router.get("/admin", authorizeRoles("Landlord"), getAdminDashboard);

export default router;
