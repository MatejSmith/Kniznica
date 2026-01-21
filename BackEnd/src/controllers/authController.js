const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


exports.register = async (req, res) => {
    const { email, password, username } = req.body;
    const errors = [];

    
    if (!email || !password || !username) {
        errors.push("Všetky polia sú povinné.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        errors.push("Neplatný formát emailu.");
    }
    if (email && email.length > 254) {
        errors.push("Email je príliš dlhý (maximum 254 znakov).");
    }

    
    if (username && (username.length < 3 || username.length > 50)) {
        errors.push("Užívateľské meno musí mať 3 až 50 znakov.");
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (username && !usernameRegex.test(username)) {
        errors.push("Užívateľské meno môže obsahovať iba písmená, čísla a podčiarkovník.");
    }

    if (password && password.length < 6) {
        errors.push("Heslo musí mať aspoň 6 znakov.");
    }
    
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
        
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username]);
        if (userExists.rows.length > 0) {
            const existingUser = userExists.rows[0];
            if (existingUser.email === email) {
                errors.push("Používateľ s týmto emailom už existuje.");
            }
            if (existingUser.username === username) {
                errors.push("Toto užívateľské meno je už obsadené.");
            }
            return res.status(400).json({ errors });
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const newUser = await pool.query(
            "INSERT INTO users (email, password, username, role) VALUES ($1, $2, $3, 'user') RETURNING user_id, email, username, role",
            [email, hashedPassword, username]
        );

        res.status(201).json({ message: "Registrácia úspešná", user: newUser.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Chyba servera");
    }
};


exports.login = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ error: "Zadajte prihlasovacie meno a heslo." });
    }

    try {
        
        const user = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $1", [identifier]);

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Nesprávne prihlasovacie údaje." });
        }

        
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ error: "Nesprávne prihlasovacie údaje." });
        }

        
        const token = jwt.sign(
            { user_id: user.rows[0].user_id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            user: {
                email: user.rows[0].email,
                username: user.rows[0].username,
                role: user.rows[0].role
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Chyba servera");
    }
};


exports.getProfile = async (req, res) => {
    try {
        
        const user = await pool.query("SELECT user_id, email, username, role, created_at FROM users WHERE user_id = $1", [req.user.user_id]);
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Chyba servera");
    }
};


exports.updateProfile = async (req, res) => {
    const { email, username, password } = req.body;
    const user_id = req.user.user_id;
    const errors = [];

    
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push("Neplatný formát emailu.");
        }
    }

    
    if (username) {
        if (username.length < 3 || username.length > 50) {
            errors.push("Užívateľské meno musí mať 3 až 50 znakov.");
        }
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            errors.push("Užívateľské meno môže obsahovať iba písmená, čísla a podčiarkovník.");
        }
    }

    
    if (password) {
        if (password.length < 6) {
            errors.push("Heslo musí mať aspoň 6 znakov.");
        }
        if (!/[A-Z]/.test(password)) {
            errors.push("Heslo musí obsahovať aspoň jedno veľké písmeno.");
        }
        if (!/[a-z]/.test(password)) {
            errors.push("Heslo musí obsahovať aspoň jedno malé písmeno.");
        }
        if (!/[0-9]/.test(password)) {
            errors.push("Heslo musí obsahovať aspoň jedno číslo.");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        
        if (email || username) {
            const conflictCheck = await pool.query(
                "SELECT email, username FROM users WHERE (email = $1 OR username = $2) AND user_id != $3",
                [email, username, user_id]
            );

            if (conflictCheck.rows.length > 0) {
                const conflict = conflictCheck.rows[0];
                if (email && conflict.email === email) errors.push("Tento email už používa iný používateľ.");
                if (username && conflict.username === username) errors.push("Toto užívateľské meno je už obsadené.");

                if (errors.length > 0) {
                    return res.status(400).json({ errors });
                }
            }
        }

        
        let querySegments = [];
        let params = [];
        let paramIndex = 1;

        if (email) {
            querySegments.push(`email = $${paramIndex++}`);
            params.push(email);
        }
        if (username) {
            querySegments.push(`username = $${paramIndex++}`);
            params.push(username);
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            querySegments.push(`password = $${paramIndex++}`);
            params.push(hashedPassword);
        }

        if (querySegments.length === 0) {
            return res.status(400).json({ error: "Neboli zaslané žiadne zmeny." });
        }

        params.push(user_id);
        const updateQuery = `UPDATE users SET ${querySegments.join(', ')} WHERE user_id = $${paramIndex} RETURNING user_id, email, username, role`;
        const updatedUser = await pool.query(updateQuery, params);

        res.json({ message: "Profil bol úspešne aktualizovaný", user: updatedUser.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Chyba servera");
    }
};