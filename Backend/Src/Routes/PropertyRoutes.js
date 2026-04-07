import express from "express";
import { 
  getAllProperties, 
  getPropertyById, 
  getLandlordProperties, 
  getAllPropertiesAdmin, 
  createProperty,
  updateProperty,
  deleteProperty
} from "../Controllers/PropertyController.js";
import { authenticateToken, authorizeRoles } from "../Middleware/Auth.js";

const router = express.Router();

// Explore rooms - available for all authenticated users (Teants/Admins)
router.get("/", authenticateToken, getAllProperties);

// Specific room details - must be before any parameterized routes that might conflict
router.get("/landlord", authenticateToken, authorizeRoles("Landlord", "Admin"), getLandlordProperties);
router.get("/admin", authenticateToken, authorizeRoles("Admin"), getAllPropertiesAdmin);

// Property CRUD - restricted to Landlords and Admins
router.post("/", authenticateToken, authorizeRoles("Landlord", "Admin"), createProperty);
router.put("/:id", authenticateToken, authorizeRoles("Landlord", "Admin"), updateProperty);
router.delete("/:id", authenticateToken, authorizeRoles("Landlord", "Admin"), deleteProperty);

// Specific room details - must be last due to :id parameter
router.get("/:id", authenticateToken, getPropertyById);

export default router;
