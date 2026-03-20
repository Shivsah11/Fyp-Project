import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Admin" },
  permissions: {
    manageUsers: { type: Boolean, default: true },
    manageProperties: { type: Boolean, default: true },
    viewAnalytics: { type: Boolean, default: true },
    systemSettings: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Admin", adminSchema);
