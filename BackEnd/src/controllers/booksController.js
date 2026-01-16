const pool = require('../config/db');
const validator = require('validator');

// Pridanie novej knihy (len pre administrátorov)
exports.addBook = async (req, res) => {
    const { title, author, isbn, description, cover_image, total_copies, available_copies } = req.body;

    // Validácia
    if (!title || !author || !isbn) {
        return res.status(400).json({ error: "Názov, autor a ISBN sú povinné." });
    }

    // Validácia formátu ISBN (ISBN-10 alebo ISBN-13)
    if (!validator.isISBN(isbn)) {
        return res.status(400).json({ error: "Neplatný formát ISBN. Použite ISBN-10 alebo ISBN-13." });
    }

    // Validácia logiky kópií
    const totalCopies = total_copies !== undefined ? parseInt(total_copies) : 1;
    const availableCopies = available_copies !== undefined ? parseInt(available_copies) : 0;

    if (availableCopies > totalCopies) {
        return res.status(400).json({ error: "Dostupné kusy nemôžu presiahnuť celkový počet." });
    }

    try {
        const newBook = await pool.query(
            `INSERT INTO books (title, author, isbn, description, cover_image, total_copies, available_copies) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [title, author, isbn, description || null, cover_image || null, totalCopies, availableCopies]
        );

        res.status(201).json({ message: "Kniha bola úspešne pridaná", book: newBook.rows[0] });

    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') { // Porušenie unique constraintu
            return res.status(400).json({ error: "Kniha s týmto ISBN už existuje." });
        }
        res.status(500).send("Chyba servera");
    }
};

// Získanie všetkých kníh
exports.getAllBooks = async (req, res) => {
    try {
        const books = await pool.query("SELECT * FROM books ORDER BY created_at DESC");
        res.json(books.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Chyba servera");
    }
};

// Aktualizácia knihy (len pre administrátorov)
exports.updateBook = async (req, res) => {
    const { id } = req.params;
    const { title, author, isbn, description, cover_image, total_copies, available_copies } = req.body;

    // Validácia
    if (!title || !author || !isbn) {
        return res.status(400).json({ error: "Názov, autor a ISBN sú povinné." });
    }

    // Validácia formátu ISBN (ISBN-10 alebo ISBN-13)
    if (!validator.isISBN(isbn)) {
        return res.status(400).json({ error: "Neplatný formát ISBN. Použite ISBN-10 alebo ISBN-13." });
    }

    // Validácia logiky kópií
    const totalCopies = total_copies !== undefined ? parseInt(total_copies) : 1;
    const availableCopies = available_copies !== undefined ? parseInt(available_copies) : 0;

    if (availableCopies > totalCopies) {
        return res.status(400).json({ error: "Dostupné kusy nemôžu presiahnuť celkový počet." });
    }

    try {
        const updatedBook = await pool.query(
            `UPDATE books 
             SET title = $1, author = $2, isbn = $3, description = $4, 
                 cover_image = $5, total_copies = $6, available_copies = $7 
             WHERE book_id = $8 
             RETURNING *`,
            [title, author, isbn, description || null, cover_image || null,
                totalCopies, availableCopies, id]
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

// Vymazanie knihy (len pre administrátorov)
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

// Získanie detailu jednej knihy
exports.getBookById = async (req, res) => {
    const { id } = req.params;
    try {
        const book = await pool.query("SELECT * FROM books WHERE book_id = $1", [id]);
        if (book.rows.length === 0) {
            return res.status(404).json({ error: "Kniha nebola nájdená." });
        }
        res.json(book.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Chyba servera");
    }
};

// Rezervácia knihy
exports.reserveBook = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Kontrola dostupnosti
        const bookCheck = await client.query(
            "SELECT available_copies FROM books WHERE book_id = $1 FOR UPDATE",
            [id]
        );

        if (bookCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Kniha nebola nájdená." });
        }

        if (bookCheck.rows[0].available_copies <= 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Kniha nie je dostupná na rezerváciu." });
        }

        // Vytvorenie rezervácie
        await client.query(
            "INSERT INTO reservations (user_id, book_id) VALUES ($1, $2)",
            [userId, id]
        );

        // Zníženie počtu dostupných kusov
        await client.query(
            "UPDATE books SET available_copies = available_copies - 1 WHERE book_id = $1",
            [id]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: "Kniha bola úspešne rezervovaná." });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send("Chyba servera pri rezervácii.");
    } finally {
        client.release();
    }
};
