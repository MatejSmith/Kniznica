const pool = require('./src/config/db');

async function migrate() {
    try {
        console.log("Starting migration...");
        // Add username column if it doesn't exist
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
        `);
        console.log("Migration successful: added username column.");

        // Update existing users if any to have a temporary username if it's NOT NULL
        // The user request didn't specify NOT NULL but the table definition they gave had it (implicit in the description "Tu je ako ma vyzerat cela tabulka Users").
        // Let's make it NOT NULL after adding it, but we need to fill it first if there are users.

        const users = await pool.query("SELECT user_id, email FROM users WHERE username IS NULL");
        for (const user of users.rows) {
            const tempUsername = user.email.split('@')[0] + user.user_id;
            await pool.query("UPDATE users SET username = $1 WHERE user_id = $2", [tempUsername, user.user_id]);
            console.log(`Updated user ${user.user_id} with temp username ${tempUsername}`);
        }

        // Set NOT NULL constraint if required
        // await pool.query("ALTER TABLE users ALTER COLUMN username SET NOT NULL");

        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
