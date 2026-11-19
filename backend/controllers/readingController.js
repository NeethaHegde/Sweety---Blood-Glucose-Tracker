
const pool = require("../config/db");

const addReading = async (req, res) => {
    try {
        // Get reading details from the request body
        const { reading_date, time_slot, glucose_value } = req.body;

        // Get the logged-in user's ID from the JWT middleware
        const user_id = req.user.id;

        // Check whether all fields are provided
        if (!reading_date || !time_slot || glucose_value === undefined || glucose_value === null || glucose_value === "") {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        // Validate the date format and actual calendar date
        if (!/^\d{4}-\d{2}-\d{2}$/.test(reading_date)) {
            return res.status(400).json({
                message: "Invalid date format. Use YYYY-MM-DD."
            });
        }

        const [year, month, day] = reading_date.split("-").map(Number);
        const dateCheck = new Date(Date.UTC(year, month - 1, day));

        if (
            dateCheck.getUTCFullYear() !== year ||
            dateCheck.getUTCMonth() !== month - 1 ||
            dateCheck.getUTCDate() !== day
        ) {
            return res.status(400).json({
                message: "Please provide a valid date."
            });
        }

        // Check whether the date is in the future
        const futureDate = await pool.query(
            "SELECT $1::date > CURRENT_DATE AS is_future",
            [reading_date]
        );

        if (futureDate.rows[0].is_future) {
            return res.status(400).json({
                message: "Future dates are not allowed."
            });
        }

        // Allowed time slots
        const allowedSlots = [
            "Morning",
            "After breakfast",
            "After lunch",
            "After dinner"
        ];

        if (!allowedSlots.includes(time_slot)) {
            return res.status(400).json({
                message: "Invalid time slot."
            });
        }

        // Validate glucose value
        const glucose = Number(glucose_value);

        if (!Number.isInteger(glucose) || glucose < 40 || glucose > 600) {
            return res.status(400).json({
                message: "Glucose value must be an integer between 40 and 600."
            });
        }

        // Insert the reading into PostgreSQL
        const result = await pool.query(
            `INSERT INTO readings
            (user_id, reading_date, time_slot, glucose_value)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [user_id, reading_date, time_slot, glucose]
        );

        return res.status(201).json({
            message: "Glucose reading added successfully!",
            reading: result.rows[0]
        });

    } catch (error) {
        console.error(error.message);

        // Handle duplicate reading for the same date and time slot
        if (error.code === "23505") {
            return res.status(409).json({
                message: "A reading already exists for this date and time slot."
            });
        }

        return res.status(500).json({
            message: "Something went wrong while adding the reading."
        });
    }
};

const getReadings = async (req, res) => {
    try {
        // Get the logged-in user's ID
        const user_id = req.user.id;

        // Fetch only this user's readings
        const result = await pool.query(
            `SELECT * FROM readings
             WHERE user_id = $1
             ORDER BY reading_date DESC, created_at DESC`,
            [user_id]
        );

        return res.status(200).json({
            message: "Readings fetched successfully!",
            readings: result.rows
        });

    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            message: "Something went wrong while fetching readings."
        });
    }
};


const updateReading = async (req, res) => {
    try {
        // Get the reading ID from the URL
        const { id } = req.params;

        // Get updated details from the request body
        const { reading_date, time_slot, glucose_value } = req.body;

        // Get logged-in user's ID
        const user_id = req.user.id;

        // Check whether all fields are provided
        if (
            !reading_date ||
            !time_slot ||
            glucose_value === undefined ||
            glucose_value === null ||
            glucose_value === ""
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(reading_date)) {
            return res.status(400).json({
                message: "Invalid date format. Use YYYY-MM-DD."
            });
        }

        const [year, month, day] = reading_date.split("-").map(Number);
        const dateCheck = new Date(Date.UTC(year, month - 1, day));

        if (
            dateCheck.getUTCFullYear() !== year ||
            dateCheck.getUTCMonth() !== month - 1 ||
            dateCheck.getUTCDate() !== day
        ) {
            return res.status(400).json({
                message: "Please provide a valid date."
            });
        }

        // Prevent future dates
        const futureDate = await pool.query(
            "SELECT $1::date > CURRENT_DATE AS is_future",
            [reading_date]
        );

        if (futureDate.rows[0].is_future) {
            return res.status(400).json({
                message: "Future dates are not allowed."
            });
        }

        // Validate time slot
        const allowedSlots = [
            "Morning",
            "After breakfast",
            "After lunch",
            "After dinner"
        ];

        if (!allowedSlots.includes(time_slot)) {
            return res.status(400).json({
                message: "Invalid time slot."
            });
        }

        // Validate glucose value
        const glucose = Number(glucose_value);

        if (!Number.isInteger(glucose) || glucose < 40 || glucose > 600) {
            return res.status(400).json({
                message: "Glucose value must be an integer between 40 and 600."
            });
        }

        // Update only if the reading belongs to this user
        const result = await pool.query(
            `UPDATE readings
             SET reading_date = $1,
                 time_slot = $2,
                 glucose_value = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
            [reading_date, time_slot, glucose, id, user_id]
        );

        // Check whether the reading exists
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found."
            });
        }

        return res.status(200).json({
            message: "Reading updated successfully!",
            reading: result.rows[0]
        });

    } catch (error) {
        console.error(error.message);

        // Handle duplicate date and time slot
        if (error.code === "23505") {
            return res.status(409).json({
                message: "A reading already exists for this date and time slot."
            });
        }

        return res.status(500).json({
            message: "Something went wrong while updating the reading."
        });
    }
};


const deleteReading = async (req, res) => {
    try {
        // Get reading ID from URL
        const { id } = req.params;

        // Get logged-in user's ID
        const user_id = req.user.id;

        // Delete only the reading belonging to this user
        const result = await pool.query(
            `DELETE FROM readings
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [id, user_id]
        );

        // Check whether the reading exists
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found."
            });
        }

        return res.status(200).json({
            message: "Reading deleted successfully!",
            reading: result.rows[0]
        });

    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            message: "Something went wrong while deleting the reading."
        });
    }
};


const getDailyReport = async (req, res) => {
    try {
        // Get the selected date from query parameters
        const { date } = req.query;

        // Get logged-in user's ID
        const user_id = req.user.id;

        // Check whether date is provided
        if (!date) {
            return res.status(400).json({
                message: "Please provide a date."
            });
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                message: "Invalid date format. Use YYYY-MM-DD."
            });
        }

        const [year, month, day] = date.split("-").map(Number);
        const dateCheck = new Date(Date.UTC(year, month - 1, day));

        if (
            dateCheck.getUTCFullYear() !== year ||
            dateCheck.getUTCMonth() !== month - 1 ||
            dateCheck.getUTCDate() !== day
        ) {
            return res.status(400).json({
                message: "Please provide a valid date."
            });
        }

        // Fetch daily readings
        const result = await pool.query(
            `SELECT
                COALESCE(MAX(glucose_value), 0) AS highest,
                COALESCE(MIN(glucose_value), 0) AS lowest,
                COALESCE(ROUND(AVG(glucose_value), 1), 0) AS average,
                COUNT(*) AS total_readings
             FROM readings
             WHERE user_id = $1 AND reading_date = $2`,
            [user_id, date]
        );

        // Fetch individual readings for that date
        const readings = await pool.query(
            `SELECT id, reading_date, time_slot, glucose_value
             FROM readings
             WHERE user_id = $1 AND reading_date = $2
             ORDER BY time_slot`,
            [user_id, date]
        );

        return res.status(200).json({
            message: "Daily report fetched successfully!",
            summary: result.rows[0],
            readings: readings.rows
        });

    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            message: "Something went wrong while generating the daily report."
        });
    }
};


const getMonthToDateReport = async (req, res) => {
    try {
        // Get the logged-in user's ID
        const user_id = req.user.id;

        // Calculate the first day of the current month
        const result = await pool.query(
            `SELECT
                COALESCE(MAX(glucose_value), 0) AS highest,
                COALESCE(MIN(glucose_value), 0) AS lowest,
                COALESCE(ROUND(AVG(glucose_value), 1), 0) AS average,
                COUNT(*) AS total_readings
             FROM readings
             WHERE user_id = $1
             AND reading_date >= DATE_TRUNC('month', CURRENT_DATE)::date
             AND reading_date <= CURRENT_DATE`,
            [user_id]
        );

        // Fetch individual readings for this month
        const readings = await pool.query(
            `SELECT id, reading_date, time_slot, glucose_value
             FROM readings
             WHERE user_id = $1
             AND reading_date >= DATE_TRUNC('month', CURRENT_DATE)::date
             AND reading_date <= CURRENT_DATE
             ORDER BY reading_date DESC, created_at DESC`,
            [user_id]
        );

        return res.status(200).json({
            message: "Month-to-date report fetched successfully!",
            summary: result.rows[0],
            readings: readings.rows
        });

    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            message: "Something went wrong while generating the month-to-date report."
        });
    }
};


const getPreviousMonthReport = async (req, res) => {
    try {
        // Get the logged-in user's ID
        const user_id = req.user.id;

        // Calculate previous month's date range
        const result = await pool.query(
            `SELECT
                COALESCE(MAX(glucose_value), 0) AS highest,
                COALESCE(MIN(glucose_value), 0) AS lowest,
                COALESCE(ROUND(AVG(glucose_value), 1), 0) AS average,
                COUNT(*) AS total_readings
             FROM readings
             WHERE user_id = $1
             AND reading_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date
             AND reading_date < DATE_TRUNC('month', CURRENT_DATE)::date`,
            [user_id]
        );

        // Fetch individual readings
        const readings = await pool.query(
            `SELECT id, reading_date, time_slot, glucose_value
             FROM readings
             WHERE user_id = $1
             AND reading_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date
             AND reading_date < DATE_TRUNC('month', CURRENT_DATE)::date
             ORDER BY reading_date DESC, created_at DESC`,
            [user_id]
        );

        return res.status(200).json({
            message: "Previous month report fetched successfully!",
            summary: result.rows[0],
            readings: readings.rows
        });

    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            message: "Something went wrong while generating the previous month report."
        });
    }
};




module.exports = { addReading, getReadings, updateReading, deleteReading, 
    getDailyReport, getMonthToDateReport, getPreviousMonthReport };
