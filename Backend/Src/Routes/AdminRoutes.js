import express from "express";
import Tenant from "../Models/Tenant.js";
import Landlord from "../Models/Landlord.js";
import { authenticateAdmin, requirePermission } from "../Middleware/AdminAuth.js";

const router = express.Router();

// Get all users
router.get("/users", authenticateAdmin, requirePermission("manageUsers"), async (req, res) => {
  try {
    const tenants = await Tenant.find({}).select('-password');
    const landlords = await Landlord.find({}).select('-password');
    
    const allUsers = [
      ...tenants.map(user => ({ ...user.toObject(), userType: 'Tenant' })),
      ...landlords.map(user => ({ ...user.toObject(), userType: 'Landlord' }))
    ];

    res.status(200).json({ users: allUsers });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user statistics
router.get("/stats", authenticateAdmin, requirePermission("manageUsers"), async (req, res) => {
  try {
    const tenantCount = await Tenant.countDocuments();
    const landlordCount = await Landlord.countDocuments();
    
    res.status(200).json({
      stats: {
        totalUsers: tenantCount + landlordCount,
        totalTenants: tenantCount,
        totalLandlords: landlordCount,
        totalProperties: 0,
        activeUsers: 0,
        recentRegistrations: 0
      }
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/users/:id", authenticateAdmin, requirePermission("manageUsers"), async (req, res) => {
  try {
    const { id } = req.params;
    
    const tenantResult = await Tenant.findByIdAndDelete(id);
    const landlordResult = await Landlord.findByIdAndDelete(id);
    
    if (!tenantResult && !landlordResult) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
