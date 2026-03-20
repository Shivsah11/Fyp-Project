import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Tenant" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Tenant", tenantSchema);
