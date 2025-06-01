const secretAngelService = require('../services/secretAngelService');

const secretAngelController = {

    createGame: async (req, res) => {
        try {
            const gameData = req.body;
            const newGame = await secretAngelService.createGame(gameData);
            return res.status(201).json(newGame);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },


    getAllGames: async (req, res) => {
        try {
            const games = await secretAngelService.getAllGames();
            return res.status(200).json(games);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },


    getGameById: async (req, res) => {
        try {
            const gameId = req.params.id;
            const game = await secretAngelService.getGameById(gameId);
            return res.status(200).json(game);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },


    updateGame: async (req, res) => {
        try {
            const gameId = req.params.id;
            const updatedData = req.body;
            const updatedGame = await secretAngelService.updateGame(gameId, updatedData);
            return res.status(200).json(updatedGame);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },


    deleteGame: async (req, res) => {
        try {
            const gameId = req.params.id;
            const deletedGame = await secretAngelService.deleteGame(gameId);
            return res.status(200).json(deletedGame);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
};

module.exports = secretAngelController;
