/**
 * @file Notification.js
 * @description Mongoose schema for system notifications pushed to users (Tenants, Landlords, Admins).
 */

import mongoose from "mongoose";

// Schema defining recipient polymorphic references, message text, notification types, links, and booking references
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel' // Polymorphic target reference mapping
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Tenant', 'Landlord', 'Admin']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'booking_approved'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking' // Optional reference to Booking model context
  },
  link: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Composite index to speed up fetching notifications ordered by date for a given recipient
notificationSchema.index({ recipient: 1, timestamp: -1 });

export default mongoose.model("Notification", notificationSchema);

