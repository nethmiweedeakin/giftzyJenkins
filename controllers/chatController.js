//Description: This service handles all operations related to gifts in the gift marketplace.
// It handles chat functionality for gifts, including viewing chat rooms, fetching chat history, and processing sale success.

const Chat = require('../models/chat');
const Gift = require('../models/gift');
const User = require('../models/user');

exports.chatRoom = async (req, res) => {
  const { giftId } = req.params;
  const gift = await Gift.findById(giftId).populate('sellerID', 'sellerName');
  if (!gift) return res.status(404).send('Gift not found');
  const selectedQuantity = parseInt(req.body.quantity) || 1;

  res.render('giftMarketplace/chat', {
    gift,
    user: req.user || { _id: req.session.user, isGuest: true },
    quantity: selectedQuantity,
  });
};

exports.getChatHistory = async (req, res) => {
  const { giftId } = req.params;
  const messages = await Chat.find({ gift: giftId })
    .populate('sender', 'name')
    .sort({ createdAt: 1 });
  

  res.json(messages);
};

exports.getSaleSuccess = async (req, res) => {
const { giftId } = req.params;
  const { quantity } = req.body;

  try {
    const gift = await Gift.findById(giftId);
    const qty = parseInt(quantity, 10);

    if (!gift) {
      return res.status(404).send('Gift not found');
    }

    // Subtract quantity, ensure availability doesn't go below 0
    gift.availability = Math.max(0, gift.availability - qty);
    await gift.save();

    req.flash('success', `Purchase verified! Availability reduced by ${qty}.`);

    res.redirect(`/gifts/${giftId}?chatStarted=true`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong!');
    res.redirect('back');
  }

};