import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
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
    ref: 'Booking'
  },
  link: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookups
notificationSchema.index({ recipient: 1, timestamp: -1 });

export default mongoose.model("Notification", notificationSchema);
