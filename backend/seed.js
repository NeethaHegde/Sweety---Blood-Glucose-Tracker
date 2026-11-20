
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});

const pool = require("./config/db");
const bcrypt = require("bcrypt");

async function seedDatabase() {
    try {
        const name = "Demo User";
        const email = "demo@sweety.com";
        const password = "Demo@123";

        // Hash the demo user's password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create the demo user if it doesn't already exist
        const userResult = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO NOTHING
             RETURNING id`,
            [name, email, passwordHash]
        );

        let userId;

        if (userResult.rows.length > 0) {
            userId = userResult.rows[0].id;
        } else {
            const existingUser = await pool.query(
                "SELECT id FROM users WHERE email = $1",
                [email]
            );

            userId = existingUser.rows[0].id;
        }

        // Insert sample glucose readings
        await pool.query(
            `INSERT INTO readings
                (user_id, reading_date, time_slot, glucose_value)
             VALUES
                ($1, CURRENT_DATE, 'Morning', 110),
                ($1, CURRENT_DATE, 'After breakfast', 145),
                ($1, CURRENT_DATE, 'After lunch', 130),
                ($1, CURRENT_DATE, 'After dinner', 118),
                ($1, CURRENT_DATE - 1, 'Morning', 105),
                ($1, CURRENT_DATE - 1, 'After lunch', 140),
                ($1, DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day', 'Morning', 108),
                ($1, DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day', 'After lunch', 135),
                ($1, DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 days', 'Morning', 120)
             ON CONFLICT (user_id, reading_date, time_slot) DO NOTHING`,
            [userId]
        );

        console.log("Demo user and readings seeded successfully!");
        console.log("Email:", email);
        console.log("Password:", password);

    } catch (error) {
        console.error("Seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

seedDatabase();
