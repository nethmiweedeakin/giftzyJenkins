//Description: This route for the gift marketplace handles all routes related to gifts.
// It includes routes for viewing gifts, adding gifts, editing gifts, deleting gifts, and managing the cart.
const express = require('express');
const router = express.Router();
const giftController = require('../controllers/giftController');
const cartController = require('../controllers/cartController');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');
const guestMiddleware = require('../middlewares/guestMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // or use diskStorage if needed



const Gift = require('../models/gift');
const User = require('../models/user');

router.get('/', guestMiddleware, giftController.listGifts);
router.get('/add', authMiddleware, giftController.showAddForm);
router.post('/add', authMiddleware, giftController.addGift);

// View cart
router.get('/cart',guestMiddleware, cartController.viewCart);

router.get('/:id', guestMiddleware, giftController.getGiftDetail);

router.post('/:id/review', authMiddleware, giftController.postReview);

// Add item to cart
router.post('/cart/add/:id', guestMiddleware, cartController.addToCart);

// Remove a specific item
router.post('/cart/remove/:id', guestMiddleware, cartController.removeFromCart);

// Clear the whole cart
router.post('/cart/clear', guestMiddleware,  cartController.clearCart);


// --- Chat Routes ---
router.post('/chat/:giftId', guestMiddleware, chatController.chatRoom); // View chat UI
router.get('/chat/:giftId/history', guestMiddleware, chatController.getChatHistory); 
router.post('/chat/:giftId/verified', guestMiddleware, chatController.getSaleSuccess);


router.get('/:id/edit', guestMiddleware, giftController.getEditForm);
router.post('/:id/edit', guestMiddleware, upload.single('image'), giftController.saveEdit);
router.post('/:id/delete', guestMiddleware, giftController.deleteGift);

module.exports = router;
