const mongoose = require('mongoose');

const fundReceivedSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    accountNumber: String,
    method: String,
    date: { type: Date, required: true }
});

module.exports = mongoose.model('FundReceived', fundReceivedSchema);