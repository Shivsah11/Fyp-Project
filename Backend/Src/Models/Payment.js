import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  description: { type: String, required: true },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Payment", paymentSchema);
