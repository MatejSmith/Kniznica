const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// Registrácia (CREATE)
exports.register = async (req, res) => {
    const { email, password } = req.body;

    // Serverová validácia
    if (!email || !password) {
        return res.status(400).json({ error: "Všetky polia sú povinné." });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Neplatný formát emailu." });
    }
    if (email.length > 254) {
        return res.status(400).json({ error: "Email je príliš dlhý (maximum 254 znakov)." });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: "Heslo musí mať aspoň 6 znakov." });
    }

    try {
        // Kontrola existencie emailu
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Používateľ s týmto emailom už existuje." });
        }

        // Vytvorenie nového používateľa
        const newUser = await pool.query(
            "INSERT INTO users (email, password, role) VALUES ($1, $2, 'user') RETURNING user_id, email, role",
            [email, password]
        );

        res.status(201).json({ message: "Registrácia úspešná", user: newUser.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Chyba servera");
    }
};

// Login (READ/Verify)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Nesprávny email alebo heslo." });
        }

        // Overenie hesla
        if (password !== user.rows[0].password) {
            return res.status(401).json({ error: "Nesprávny email alebo heslo." });
        }

        // Generovanie JWT
        const token = jwt.sign(
            { user_id: user.rows[0].user_id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token, user: { email: user.rows[0].email, role: user.rows[0].role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Chyba servera");
    }
};

// Získanie profilu (READ Protected)
exports.getProfile = async (req, res) => {
    try {
        // req.user je nastavený cez middleware overenia tokenu
        const user = await pool.query("SELECT user_id, email, role, created_at FROM users WHERE user_id = $1", [req.user.user_id]);
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Chyba servera");
    }
};