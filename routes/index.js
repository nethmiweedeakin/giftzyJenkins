const express = require('express');
const router = express.Router();

const usersRouter = require('./userRoutes');

const pageRouter = require('./pageRoutes');

const giftRouter = require('./giftRoutes');

router.use('/', pageRouter);

router.use('/api/users', usersRouter);

router.use('/gifts', giftRouter); // This enables `/gifts`, `/gifts/add`, etc.

module.exports = router;
