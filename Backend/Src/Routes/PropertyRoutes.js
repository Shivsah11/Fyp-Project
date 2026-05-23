/**
 * @file PropertyRoutes.js
 * @description Express routing configuration for property listings. Routes include public/tenant lookup and restricted Landlord/Admin CRUD operations.
 */

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

// Explore properties - available for all authenticated users (Tenants, Landlords, Admins)
router.get("/", authenticateToken, getAllProperties);

// Specific room details or system scopes - must be placed before dynamic parameters to avoid conflicts
router.get("/landlord", authenticateToken, authorizeRoles("Landlord", "Admin"), getLandlordProperties);
router.get("/admin", authenticateToken, authorizeRoles("Admin"), getAllPropertiesAdmin);

// Property CRUD - restricted to Landlords and Admins
router.post("/", authenticateToken, authorizeRoles("Landlord", "Admin"), createProperty);
router.put("/:id", authenticateToken, authorizeRoles("Landlord", "Admin"), updateProperty);
router.delete("/:id", authenticateToken, authorizeRoles("Landlord", "Admin"), deleteProperty);

// Specific room details lookup by ID - must be last due to :id parameter placeholder matching everything
router.get("/:id", authenticateToken, getPropertyById);

export default router;

