const pool = require('../config/db');


exports.addReview = async (req, res) => {
    const { book_id, rating, comment } = req.body;
    const user_id = req.user.user_id;

    if (!book_id || !rating || !comment) {
        return res.status(400).json({ error: "Všetky polia (hodnotenie, komentár) sú povinné." });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Hodnotenie musí byť v rozsahu 1 až 5 hviezd." });
    }

    try {
        
        const existingReview = await pool.query(
            "SELECT * FROM reviews WHERE user_id = $1 AND book_id = $2",
            [user_id, book_id]
        );

        if (existingReview.rows.length > 0) {
            return res.status(400).json({ error: "Na túto knihu ste už pridali recenziu." });
        }

        const newReview = await pool.query(
            "INSERT INTO reviews (user_id, book_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
            [user_id, book_id, rating, comment]
        );

        res.status(201).json(newReview.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Chyba servera");
    }
};


exports.getReviewsByBook = async (req, res) => {
    const { bookId } = req.params;

    try {
        const reviews = await pool.query(
            `SELECT r.*, u.username 
             FROM reviews r 
             JOIN users u ON r.user_id = u.user_id 
             WHERE r.book_id = $1 
             ORDER BY r.created_at DESC`,
            [bookId]
        );

        res.json(reviews.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Chyba servera");
    }
};
