const mongoose = require('mongoose');

const wallets = mongoose.Schema({
    userId: { type: String, required: true },
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
    address: { type: String, required: true },
    depositedAmount: { type: Number, default: 0, required: true },
    newDeposit: { type: Number, default: 0, required: true, enum: [0, 1] },
    timestamp: { type: Number, default: Date.now },
    dateTime: { type: Date, default: Date.now },
});


module.exports = mongoose.model('wallets', wallets);