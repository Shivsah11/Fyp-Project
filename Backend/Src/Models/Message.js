import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Tenant', 'Landlord', 'Admin']
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Tenant', 'Landlord', 'Admin']
  },
  subject: {
    type: String,
    required: true,
    default: 'No Subject'
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['landlord', 'system', 'support', 'sent'],
    default: 'landlord'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Message", messageSchema);
