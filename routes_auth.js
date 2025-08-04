const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if ((username === 'Abk' && password === 'bastiabk') || (username === 'cpabk' && password === '985973abk')) {
        res.json({ user: username });
    } else {
        res.status(401).json({ message: 'Invalid Username or Password!' });
    }
});

module.exports = router;