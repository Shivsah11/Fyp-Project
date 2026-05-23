/**
 * @file Admin.js
 * @description Mongoose schema definition for the Admin model, storing admin profile, permissions, and settings.
 */

import mongoose from "mongoose";

// Schema defining administrator credentials, fine-grained access permissions, preferences, and referral features
const adminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Admin" },
  // Granular admin capabilities flags
  permissions: {
    manageUsers: { type: Boolean, default: true },
    manageProperties: { type: Boolean, default: true },
    viewAnalytics: { type: Boolean, default: true },
    systemSettings: { type: Boolean, default: false }
  },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  bio: { type: String, default: '' },
  // Localized preferences (notifications, theme, timezone)
  preferences: {
    notifications: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    language: { type: String, default: 'english' },
    timezone: { type: String, default: 'Asia/Kathmandu' },
    theme: { type: String, default: 'dark' }
  },
  referralCode: { type: String, unique: true, sparse: true },
  coins: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Admin", adminSchema);

