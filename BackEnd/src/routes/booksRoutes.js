const router = require('express').Router();
const booksController = require('../controllers/booksController');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// upload obrazka je vygenerovany pomocou AI
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Iba obrázkové súbory sú povolené.'));
    },
    limits: { fileSize: 5 * 1024 * 1024 } 
});

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

router.post('/upload-image', verifyToken, verifyAdmin, upload.single('image'), booksController.uploadImage);
router.get('/', booksController.getAllBooks);
router.get('/mine', verifyToken, booksController.getUserReservations);
router.get('/:id', booksController.getBookById);  
router.post('/:id/reserve', verifyToken, booksController.reserveBook);
router.put('/:id', verifyToken, verifyAdmin, booksController.updateBook);
router.delete('/:id', verifyToken, verifyAdmin, booksController.deleteBook);
router.get('/:id/reservation', verifyToken, booksController.checkReservation);
router.delete('/:id/reserve', verifyToken, booksController.cancelReservation);


module.exports = router;
