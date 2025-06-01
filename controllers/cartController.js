//Description: This service handles all operations related to gifts in the gift marketplace.
//It includes cart management functions such as adding items, removing items, and clearing the cart.

const giftService = require('../services/giftService.js');
const Gift = require('../models/gift');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const Cart = require('../models/cart');

//Cart exports

// View Cart
exports.viewCart = (req, res) => {
  const cart = req.session.cart || [];
  res.render('giftMarketplace/cart', { cart,  user: req.user });
};

// Add to Cart
exports.addToCart = async (req, res) => {
  const giftId = req.params.id;
  const selectedQuantity = parseInt(req.body.quantity) || 1;

  try {
    const gift = await Gift.findById(giftId);
    if (!gift) return res.status(404).send('Gift not found');

    // Initialize session cart if not already
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Update session cart
    const existingSessionItem = req.session.cart.find(item => item.id === giftId);
    if (existingSessionItem) {
      existingSessionItem.quantity += selectedQuantity;
    } else {
      req.session.cart.push({
        id: gift._id.toString(),
        name: gift.name,
        quantity: selectedQuantity
      });
    }

    // Decode token to get userId
    const token = req.cookies.token;
    let userId = null;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }

    if (userId) {
      // Check if a cart already exists for this user
      let dbCart = await Cart.findOne({ userId });

      if (dbCart) {
        const existingDBItem = dbCart.items.find(item => item.giftId.toString() === giftId);

        if (existingDBItem) {
          existingDBItem.quantity += selectedQuantity;
        } else {
          dbCart.items.push({ giftId: gift._id, quantity: selectedQuantity });
        }

        await dbCart.save();
      } else {
        // Create a new cart
        const newCart = new Cart({
          userId,
          items: [{ giftId: gift._id, quantity: selectedQuantity }]
        });

        await newCart.save();
      }
    }

    res.redirect('/gifts/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


// Remove specific item
exports.removeFromCart = async (req, res) => {
const giftId = req.params.id;

  try {
    // Remove from session
    req.session.cart = (req.session.cart || []).filter(item => item.id !== giftId);

    // Decode token
    const token = req.cookies.token;
    let userId = null;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }

    if (userId) {
      // Find and update DB cart
      const cart = await Cart.findOne({ userId });
      if (cart) {
        cart.items = cart.items.filter(item => item.giftId.toString() !== giftId);
        await cart.save();
      }
    }

    res.redirect('/gifts/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
    try {
    // Clear session cart
    req.session.cart = [];

    // Decode token
    const token = req.cookies.token;
    let userId = null;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }

    if (userId) {
      // Find and clear DB cart
      const cart = await Cart.findOne({ userId });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
    }

    res.redirect('/gifts/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


