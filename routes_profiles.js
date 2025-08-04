const express = require('express');
const Profile = require('../models/Profile');
const router = express.Router();

// Middleware to check admin access
const isAdmin = (req, res, next) => {
    if (req.headers['x-user'] === 'cpabk') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

// Get all profiles
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find();
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new profile
router.post('/', async (req, res) => {
    try {
        const existingProfile = await Profile.findOne({ cnic: req.body.cnic });
        if (existingProfile && !req.body.editCnic) {
            return res.status(400).json({ message: 'This CNIC already exists!' });
        }
        if (req.body.editCnic) {
            const profile = await Profile.findOneAndUpdate(
                { cnic: req.body.editCnic },
                req.body,
                { new: true }
            );
            return res.json(profile);
        }
        const profile = new Profile(req.body);
        await profile.save();
        res.status(201).json(profile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete profile and its children
router.delete('/:cnic', isAdmin, async (req, res) => {
    try {
        async function deleteBranch(cnic) {
            const children = await Profile.find({ fatherCNIC: cnic });
            for (const child of children) {
                await deleteBranch(child.cnic);
            }
            await Profile.deleteOne({ cnic });
        }
        await deleteBranch(req.params.cnic);
        res.json({ message: 'Profile and children deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;