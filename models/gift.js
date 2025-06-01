//Description: This file defines the Gift model schema for a MongoDB database using Mongoose.
// It includes fields for gift details such as name, description, price, image URL, availability, category, and seller information.
// It also includes fields for reviews and ratings, allowing users to leave feedback on gifts.

const mongoose = require('mongoose');

const giftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
  availability: { type: Number, required: true },
  category: { type: String, required: true },
  inCartUsers: { type: Array, default: [] },
  rating: { type: Number, default: 0 },
  sellerID: { type: String, default: '123' },  
  sellerName: { type: String, default: 'user' },
  sellerEmail: { type: String, default: 'user@gmail.com' },
  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, required: true },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ], 

});

module.exports = mongoose.models.Gift || mongoose.model('Gift', giftSchema);