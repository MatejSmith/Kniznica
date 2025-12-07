const pool = require('../config/db');

// Add a new book (admin only)
exports.addBook = async (req, res) => {
    const { title, author, isbn, description, cover_image, total_copies, available_copies } = req.body;

    // Validation
    if (!title || !author || !isbn) {
        return res.status(400).json({ error: "Názov, autor a ISBN sú povinné." });
    }

    try {
        const newBook = await pool.query(
            `INSERT INTO books (title, author, isbn, description, cover_image, total_copies, available_copies) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [title, author, isbn, description || null, cover_image || null, total_copies || 1, available_copies || 1]
        );

        res.status(201).json({ message: "Kniha bola úspešne pridaná", book: newBook.rows[0] });

    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') { // Unique constraint violation
            return res.status(400).json({ error: "Kniha s týmto ISBN už existuje." });
        }
        res.status(500).send("Chyba servera");
    }
};

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const books = await pool.query("SELECT * FROM books ORDER BY created_at DESC");
        res.json(books.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Chyba servera");
    }
};

// Update a book (admin only)
exports.updateBook = async (req, res) => {
    const { id } = req.params;
    const { title, author, isbn, description, cover_image, total_copies, available_copies } = req.body;

    // Validation
    if (!title || !author || !isbn) {
        return res.status(400).json({ error: "Názov, autor a ISBN sú povinné." });
    }

    try {
        const updatedBook = await pool.query(
            `UPDATE books 
             SET title = $1, author = $2, isbn = $3, description = $4, 
                 cover_image = $5, total_copies = $6, available_copies = $7 
             WHERE book_id = $8 
             RETURNING *`,
            [title, author, isbn, description || null, cover_image || null,
                total_copies || 1, available_copies || 1, id]
        );

        if (updatedBook.rows.length === 0) {
            return res.status(404).json({ error: "Kniha nebola nájdená." });
        }

        res.json({ message: "Kniha bola úspešne aktualizovaná", book: updatedBook.rows[0] });

    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') { // Unique constraint violation
            return res.status(400).json({ error: "Kniha s týmto ISBN už existuje." });
        }
        res.status(500).send("Chyba servera");
    }
};

// Delete a book (admin only)
exports.deleteBook = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBook = await pool.query(
            "DELETE FROM books WHERE book_id = $1 RETURNING *",
            [id]
        );

        if (deletedBook.rows.length === 0) {
            return res.status(404).json({ error: "Kniha nebola nájdená." });
        }

        res.json({ message: "Kniha bola úspešne vymazaná", book: deletedBook.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Chyba servera");
    }
};
