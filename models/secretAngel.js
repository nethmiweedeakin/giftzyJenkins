const mongoose = require('mongoose');

const secretAngelGameSchema = new mongoose.Schema(
    {
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],
        budget: {
            type: Number,
            required: true,
        },
        assignment: {
            type: String,
            required: false,
        },
        wishlist: {
            type: [String],
            required: false,
        },
        link: {
            type: String,
            required: false,
        },
        password: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

const SecretAngelGame = mongoose.model('SecretAngelGame', secretAngelGameSchema);
module.exports = SecretAngelGame;
