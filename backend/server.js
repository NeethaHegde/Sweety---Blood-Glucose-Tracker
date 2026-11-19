const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});


const express = require("express");
const cors = require("cors");
const pool = require('./config/db')
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
const authMiddleware = require("./middleware/authMiddleware");
const readingRoutes = require("./routes/readingRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
console.log("Auth routes loaded");

// Test route
app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully!",
            time: result.rows[0].now
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

//test
app.get("/api/auth/protected-test", authMiddleware, (req, res) => {
    res.json({
        message: "Access granted!",
        userId: req.user.id
    });
});
// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
