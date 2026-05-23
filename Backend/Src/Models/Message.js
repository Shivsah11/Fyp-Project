/**
 * @file Message.js
 * @description Mongoose schema for the Message model, representing chat and system communication between Tenants, Landlords, and Admins.
 */

import mongoose from "mongoose";

// Schema defining sender and recipient fields using dynamic refPath to allow polymorph relationship with Tenant, Landlord, or Admin
const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel' // Dynamically reference the schema specified in senderModel field
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Tenant', 'Landlord', 'Admin']
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel' // Dynamically reference the schema specified in recipientModel field
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

