//Description: This service handles all operations related to gifts in the gift marketplace.
// It includes functions to get, create, update, delete gifts, and manage reviews.
// This service is used by the gift controller to interact with the database and perform operations.

const e = require('express');
const Gift = require('../models/gift');
const jwt = require('jsonwebtoken');
const Cart = require('../models/cart');

exports.loadCartFromDB = async (req, token) => {
  let userId = null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
    console.log('Decoded user ID:', userId);
  } catch (err) {
    console.error('JWT decode error during login cart load:', err);
    return;
  }

  if (!userId) return;

  try {
    const existingCart = await Cart.findOne({ userId });

    if (existingCart && existingCart.items.length > 0) {
      const sessionCart = [];

      for (const item of existingCart.items) {
        const gift = await Gift.findById(item.giftId);

        if (gift) {
          sessionCart.push({
            id: gift._id,
            name: gift.name,
            quantity: item.quantity
          });
        } else {
          // Fallback if gift is deleted or missing
          sessionCart.push({
            id: item.giftId,
            name: '(Gift not found)',
            quantity: item.quantity
          });
        }
      }

      req.session.cart = sessionCart;
      console.log('Cart loaded from DB into session:', req.session.cart);
    } else {
      console.log('No cart found for user or cart is empty.');
    }
  } catch (dbErr) {
    console.error('Error loading cart from DB:', dbErr);
  }
};


function getUserIdFromToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded user ID:', decoded.id);
    return decoded.id;
  } catch (err) {
    console.error('JWT decode error:', err);
    return null;
  }
}

function formatCartItems(cart) {
  return cart.map(item => ({
    giftId: item.id,
    quantity: item.quantity || 1
  }));
}

async function upsertCart(userId, items) {
  let existingCart = await Cart.findOne({ userId });

  if (existingCart) {
    mergeItemsIntoCart(existingCart, items);
    await existingCart.save();
    console.log('Existing cart updated in DB');
  } else {
    const newCart = new Cart({ userId, items });
    await newCart.save();
    console.log('New cart created and saved to DB');
  }
}

function mergeItemsIntoCart(cart, newItems) {
  const dbItemsMap = new Map();
  cart.items.forEach(item => {
    dbItemsMap.set(item.giftId.toString(), item);
  });

  for (const newItem of newItems) {
    const existingItem = dbItemsMap.get(newItem.giftId);
    if (existingItem) {
      // Only update if quantity is different (optional guard)
      if (existingItem.quantity !== newItem.quantity) {
        existingItem.quantity = Math.max(existingItem.quantity, newItem.quantity);
      }
    } else {
      cart.items.push(newItem);
    }
  }
}


async function addUserToGiftInCarts(userId, items) {
  for (const item of items) {
    await Gift.findByIdAndUpdate(
      item.giftId,
      { $addToSet: { inCartUsers: userId } }
    );
  }
}
exports.handleCartOnLogout = async (req) => {
  const sessionCart = req.session.cart;
  const userId = getUserIdFromToken(req.cookies.token);

  if (Array.isArray(sessionCart) && sessionCart.length > 0 && userId) {
    const formattedItems = formatCartItems(sessionCart);

    try {
      await upsertCart(userId, formattedItems);
      await addUserToGiftInCarts(userId, formattedItems);
    } catch (err) {
      console.error('Cart save/update error:', err);
    }
  } else {
    console.log('No cart to save or user not authenticated.');
  }

  // Clear it right away to avoid future merges of same data
  req.session.cart = null;
};
