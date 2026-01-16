const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Registrácia (CREATE)
exports.register = async (req, res) => {
    const { email, password } = req.body;
    const errors = [];

    // Serverová validácia
    if (!email || !password) {
        errors.push("Všetky polia sú povinné.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        errors.push("Neplatný formát emailu.");
    }
    if (email && email.length > 254) {
        errors.push("Email je príliš dlhý (maximum 254 znakov).");
    }
    if (password && password.length < 6) {
        errors.push("Heslo musí mať aspoň 6 znakov.");
    }
    // Kontrola sily hesla
    if (password && !/[A-Z]/.test(password)) {
        errors.push("Heslo musí obsahovať aspoň jedno veľké písmeno.");
    }
    if (password && !/[a-z]/.test(password)) {
        errors.push("Heslo musí obsahovať aspoň jedno malé písmeno.");
    }
    if (password && !/[0-9]/.test(password)) {
        errors.push("Heslo musí obsahovať aspoň jedno číslo.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Kontrola existencie emailu
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ errors: ["Používateľ s týmto emailom už existuje."] });
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