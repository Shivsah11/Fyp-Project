/**
 * @file Booking.js
 * @description Mongoose schema definition for property rental bookings, handling state, payments, and relations.
 */

import mongoose from "mongoose";

// Schema defining references to Property, Tenant, and Landlord models, along with check-in details, status options, and pricing
const bookingSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Landlord' },
  checkInDate: { type: String, required: true },
  checkOutDate: { type: String, default: '' },
  // Booking progress status flags
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded', 'Pending', 'Confirmed', 'Cancelled'],
    default: 'pending'
  },
  // Financial progress status flags
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  price: { type: String, required: true },
  totalAmount: { type: Number, default: 0 },
  numberOfGuests: { type: Number, default: 1 },
  specialRequests: { type: String, default: '' },
  cancellationReason: { type: String, default: '' },
  cancellationDate: { type: String, default: '' },
  bookingDate: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Database indices to optimize search querying performance on reference IDs, status values, and date ranges
bookingSchema.index({ propertyId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);

