const express = require('express');
const router = express.Router();
const { secretAngelController } = require('../controllers');
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/', authMiddleware, secretAngelController.getAllGames);


router.post('/', authMiddleware, secretAngelController.createGame);


router.get('/:id', authMiddleware, secretAngelController.getGameById);


router.put('/:id', authMiddleware, secretAngelController.updateGame);


router.delete('/:id', authMiddleware, secretAngelController.deleteGame);

module.exports = router;
