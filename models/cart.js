//DEscription: This file defines the Gift model schema for a MongoDB database using Mongoose.
// This schema includes fields for gift details, seller information, reviews, and more.

const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // For guests, this will remain null
  },
  sessionId: {
    type: String,
    default: null // For guests, associate with a session or temporary ID
  },
  items: [
    {
      giftId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gift',
        required: true
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
cartSchema.index({ userId: 1 });      // Speeds up lookups for logged-in users
cartSchema.index({ sessionId: 1 });   // Speeds up lookups for guest carts

module.exports = mongoose.model('Cart', cartSchema);
