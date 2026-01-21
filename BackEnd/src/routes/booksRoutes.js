const router = require('express').Router();
const booksController = require('../controllers/booksController');
const jwt = require('jsonwebtoken');

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


const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'administrator') {
        return res.status(403).json({ error: "Prístup len pre administrátorov." });
    }
    next();
};

router.post('/', verifyToken, verifyAdmin, booksController.addBook);
router.get('/', booksController.getAllBooks);
router.get('/mine', verifyToken, booksController.getUserReservations);
router.get('/:id', booksController.getBookById);  
router.post('/:id/reserve', verifyToken, booksController.reserveBook);
router.put('/:id', verifyToken, verifyAdmin, booksController.updateBook);
router.delete('/:id', verifyToken, verifyAdmin, booksController.deleteBook);
router.get('/:id/reservation', verifyToken, booksController.checkReservation);
router.delete('/:id/reserve', verifyToken, booksController.cancelReservation);


module.exports = router;
