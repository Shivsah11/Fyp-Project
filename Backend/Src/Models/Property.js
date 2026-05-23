/**
 * @file Property.js
 * @description Mongoose schema for rental Property listings, including details, amenities, landlord references, and geo-coordinates.
 */

import mongoose from "mongoose";

// Schema defining rental listing attributes, landlord reference ID, verification status, image URLs, and GPS location coordinates
const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['apartment', 'house', 'studio', 'room'], default: 'apartment' },
  beds: { type: Number, default: 0 },
  baths: { type: Number, default: 1 },
  area: { type: Number, default: 0 },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Landlord', required: true },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended', 'Available', 'Rented', 'Maintenance'],
    default: 'pending'
  },
  images: { type: [String], default: [] }, // Array containing URLs/base64 strings for listing images
  image: { type: String }, // Kept for backward compatibility with single-image setups
  amenities: { type: [String], default: [] }, // Amenities list (e.g. WiFi, Parking, AC)
  lat: { type: Number, default: 27.7172 }, // Default Latitude coordinates (defaulting to Kathmandu area)
  lng: { type: Number, default: 85.3240 }, // Default Longitude coordinates
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Database indices to optimize query performance when searching by Landlord or status
propertySchema.index({ landlordId: 1 });
propertySchema.index({ status: 1 });

export default mongoose.model("Property", propertySchema);

