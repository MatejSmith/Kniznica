const router = require('express').Router();
const reviewsController = require('../controllers/reviewsController');
const jwt = require('jsonwebtoken');

// Middleware na overenie tokenu
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(403).json({ error: "Prístup odmietnutý." });

    try {
        req.user = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ error: "Neplatný token." });
    }
};

router.post('/', verifyToken, reviewsController.addReview);
router.get('/:bookId', reviewsController.getReviewsByBook);

module.exports = router;
