//Description: This controller handles all operations related to gifts in the gift marketplace.
// It includes functions to list gifts, view gift details, add gifts, edit gifts, delete gifts, and manage reviews.
// It interacts with the giftService to perform database operations and render views.

const giftService = require('../services/giftService.js');
const Gift = require('../models/gift');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const Cart = require('../models/cart');


exports.listGifts = async (req, res) => {
  let gifts = await giftService.getAllGifts();
  const search = req.query.search || '';
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};

  if(search !== '') {
 gifts = await Gift.find(query);
  }

   let buyer = null;
  if (req.user?.id) {
    const dbUser = await User.findById(req.user.id).lean(); // lean for performance
    buyer = dbUser?.buyer || null;
  }
  res.render('giftMarketplace/index', { gifts, user: req.user, buyer, search  });
};

exports.getGiftDetail = async (req, res) => {
  try {
    const gift = await Gift.findById(req.params.id)
      .populate('reviews.userId', 'name') // Populate only the 'name' field of user

    if (!gift) {
      return res.status(404).send('Gift not found');
    }

    res.render('giftMarketplace/detail', {
      gift,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.showAddForm = (req, res) => {
  res.render('giftMarketplace/add', { user: req.user});
};

exports.addGift = async (req, res) => {
  await giftService.createGift(req.body);
  res.redirect('/giftMarketplace');
};

exports.postReview = async (req, res) => {
  await giftService.postReviewIntoDB(req, res);
};

exports.getEditForm = async (req, res) => {
  await giftService.getEditForm(req, res);
};

exports.saveEdit = async (req, res) => {
  await giftService.saveEdit(req, res);
};

exports.deleteGift = async (req, res) => {
  try {
    const gift = await Gift.findById(req.params.id);

    if (!gift) {
      return res.status(404).send('Gift not found');
    }

    if (gift.sellerID.toString() !== req.user.id) {
      return res.status(403).send('Unauthorized to delete this gift');
    }

    await Gift.findByIdAndDelete(req.params.id);
    res.redirect('/gifts');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
