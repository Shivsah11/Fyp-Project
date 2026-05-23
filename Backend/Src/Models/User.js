/**
 * @file User.js
 * @description Mongoose schema definition for the base User model (shared or generic account properties).
 */

import mongoose from "mongoose";

// Schema defining basic user details, coins balance, and optional referral fields
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  referralCode: { type: String, unique: true, sparse: true },
  coins: { type: Number, default: 0 },
});

export default mongoose.model("User", userSchema);

