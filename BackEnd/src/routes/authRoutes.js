const router = require('express').Router();
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');

// Middleware na overenie tokenu
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(403).json({ error: "Prístup odmietnutý." });

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ error: "Neplatný token." });
    }
};

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.delete('/profile', verifyToken, authController.deleteAccount);

module.exports = router;