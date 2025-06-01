const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const giftService = require('../services/giftService');


router.get('/', authMiddleware, (req, res) => {
  const user = req?.user || null;
  res.render('home', { title: 'Home Page', error: null, user });
});

router.get('/login', (req, res) => {
  res.render('auth/login', { error: null, user: null });
});

router.get('/signup', (req, res) => {
  res.render('auth/signup', { error: null, user: null });
});

router.get('/settings', authMiddleware, (req, res) => {
  res.render('auth/userSetting', { error: null, user: req.user });
});

router.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.tokenType !== 'reset') {
      throw new Error('Invalid token type');
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      throw new Error('Token has expired');
    }

    const user = decoded.user;

    res.render('auth/reset-password', { user, token });
  } catch (err) {

    console.error('Error verifying token:', err);
    res.status(400).send('Invalid or expired reset link');
  }
});

router.get('/secret-angel', authMiddleware, (req, res) => {
  res.render('secretAngel/index', { error: null, user: req.user });
});

router.get('/giftMarketplace', async (req, res) => {
  const gifts = await giftService.getAllGifts(); // Fetch the gifts
  res.render('giftMarketplace/index', { gifts, user: req.user }); // Pass 'gifts' and 'user' to the template
});

module.exports = router;
