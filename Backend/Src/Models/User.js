import mongoose from "mongoose";

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
