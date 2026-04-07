import jwt from "jsonwebtoken";
import Admin from "../Models/Admin.js";

export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    const admin = await Admin.findOne({ _id: decoded.userId });
    if (!admin || !admin.isActive) {
      return res.status(403).json({ message: "Admin access required" });
    }

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

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions[permission]) {
      return res.status(403).json({ message: `Permission required: ${permission}` });
    }
    next();
  };
};
