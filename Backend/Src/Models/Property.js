import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['apartment', 'house', 'studio', 'room'], default: 'apartment' },
  rating: { type: Number, default: 0 },
  beds: { type: Number, default: 0 },
  baths: { type: Number, default: 1 },
  area: { type: Number, default: 0 },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Landlord', required: true },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended', 'Available', 'Rented', 'Maintenance'],
    default: 'pending'
  },
  images: { type: [String], default: [] },
  image: { type: String }, // Keep for backward compatibility
  amenities: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indices for performance
propertySchema.index({ landlordId: 1 });
propertySchema.index({ status: 1 });

export default mongoose.model("Property", propertySchema);
