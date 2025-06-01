const { SecretAngelGame } = require('../models');

const secretAngelService = {

    createGame: async (gameData) => {
        try {

            const game = new SecretAngelGame(gameData);


            const members = gameData.members;


            const shuffledMembers = shuffleArray([...members]);

            const assignments = members.map((member, index) => ({
                user: member,
                secretAngel: shuffledMembers[(index + 1) % shuffledMembers.length],
            }));

            game.assignment = assignments;

            await game.save();

            return game;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    getAllGames: async () => {
        try {
            return await SecretAngelGame.find().populate('host members');
        } catch (error) {
            throw new Error(error.message);
        }
    },


    getGameById: async (gameId) => {
        try {
            return await SecretAngelGame.findById(gameId).populate('host members');
        } catch (error) {
            throw new Error(error.message);
        }
    },


    updateGame: async (gameId, updatedData) => {
        try {
            const game = await SecretAngelGame.findByIdAndUpdate(gameId, updatedData, { new: true });
            if (!game) throw new Error('Game not found');
            return game;
        } catch (error) {
            throw new Error(error.message);
        }
    },


    deleteGame: async (gameId) => {
        try {
            const game = await SecretAngelGame.findByIdAndDelete(gameId);
            if (!game) throw new Error('Game not found');
            return game;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

module.exports = secretAngelService;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
