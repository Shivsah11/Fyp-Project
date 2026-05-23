/**
 * @file Auth.js
 * @description General-purpose Authentication and Authorization Middleware using JSON Web Tokens (JWT).
 */

import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate requests using JWT.
 * Extracts the Bearer token from the 'Authorization' header, verifies it, 
 * and attaches the decoded user details to the request object.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // Extract token from format: Bearer <TOKEN>
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    // Verify token validity against the JWT secret key
    jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      // Attach the decoded token payload (user details) to the request object
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error in authentication" });
  }
};

/**
 * Middleware factory to authorize user access based on roles.
 * Restricts access to endpoints by verifying that the authenticated user's role 
 * matches one of the authorized roles.
 *
 * @param {...String} roles - List of allowed roles (e.g., 'admin', 'landlord', 'tenant').
 * @returns {Function} Express middleware function.
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Normalize both required roles and user role to lowercase for case-insensitive comparison
    const normalizedRoles = roles.map(role => role.toLowerCase());
    const userRole = req.user.role ? req.user.role.toLowerCase() : "";

    // Deny access if the user's role is not included in the allowed list
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

