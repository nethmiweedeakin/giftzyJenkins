//Description: This file defines the Gift model schema for a MongoDB database using Mongoose.
//It handles chat messages in a gift marketplace application.
// It includes fields for sender, message, gift reference, timestamp, and guest session ID.
// It also includes an optional image URL field for sending images in chat messages.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chatSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isGuest: { type: Boolean, default: false },
  gift: { type: mongoose.Schema.Types.ObjectId, ref: 'Gift' },
  message: { type: String, required: false },
   // Add this new field
  imageUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
  guestSessionId: { type: String },
});

module.exports = mongoose.models.Chat || mongoose.model('Chat', chatSchema);