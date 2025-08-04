const express = require('express');
const FundReceived = require('../models/FundReceived');
const FundUsed = require('../models/FundUsed');
const router = express.Router();

// Get funds for a specific month
router.get('/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
        const fundsReceived = await FundReceived.find({
            date: {
                $gte: new Date(year, month - 1, 1),
                $lte: new Date(year, month, 0)
            }
        });
        const fundsUsed = await FundUsed.find({
            date: {
                $gte: new Date(year, month - 1, 1),
                $lte: new Date(year, month, 0)
            }
        });
        res.json({ fundsReceived, fundsUsed });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add fund received
router.post('/received', async (req, res) => {
    try {
        const fund = new FundReceived(req.body);
        await fund.save();
        res.status(201).json(fund);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add fund used
router.post('/used', async (req, res) => {
    try {
        const { year, month } = req.body;
        const fundsReceived = await FundReceived.find({
            date: {
                $gte: new Date(year, month - 1, 1),
                $lte: new Date(year, month, 0)
            }
        });
        const fundsUsed = await FundUsed.find({
            date: {
                $gte: new Date(year, month - 1, 1),
                $lte: new Date(year, month, 0)
            }
        });
        const totalReceived = fundsReceived.reduce((sum, fund) => sum + fund.amount, 0);
        const totalUsed = fundsUsed.reduce((sum, fund) => sum + fund.amount, 0);
        const currentBalance = totalReceived - totalUsed;
        if (req.body.amount > currentBalance) {
            return res.status(400).json({ message: 'Insufficient funds!' });
        }
        const fund = new FundUsed(req.body);
        await fund.save();
        res.status(201).json(fund);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;