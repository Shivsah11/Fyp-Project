/**
 * @file AdminAuth.js
 * @description Authentication and permission authorization middleware specifically designed for Admin users.
 */

import jwt from "jsonwebtoken";
import Admin from "../Models/Admin.js";

/**
 * Middleware to authenticate requests originating from admins.
 * Verifies the JWT, checks if the corresponding Admin account exists in the database and is active,
 * and sets detailed administrator information (role, permissions) on the request.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    // Verify token validity
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    // Retrieve Admin account and verify status
    const admin = await Admin.findOne({ _id: decoded.userId });
    if (!admin || !admin.isActive) {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Attach comprehensive admin user details and permissions list to request object
    req.user = {
      userId: admin._id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    };

    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/**
 * Middleware generator to enforce fine-grained permissions for specific admin actions.
 * Checks if the authenticated admin has the requested permission flag set to true.
 *
 * @param {String} permission - Name of the permission key required (e.g. 'manageProperties', 'manageUsers').
 * @returns {Function} Express middleware function.
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    // Check if the current authenticated user has the specified permission enabled
    if (!req.user || !req.user.permissions[permission]) {
      return res.status(403).json({ message: `Permission required: ${permission}` });
    }
    next();
  };
};

