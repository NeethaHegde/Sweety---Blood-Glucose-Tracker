
const express = require("express");
const router = express.Router();

const {
    addReading,
    getReadings,
    updateReading,
    deleteReading,
    getDailyReport,
    getMonthToDateReport,
    getPreviousMonthReport
} = require("../controllers/readingController");

const authMiddleware = require("../middleware/authMiddleware");

// Create a new glucose reading
router.post("/", authMiddleware, addReading);

// Get all glucose readings
router.get("/", authMiddleware, getReadings);

// Report routes
router.get("/daily", authMiddleware, getDailyReport);
router.get("/month-to-date", authMiddleware, getMonthToDateReport);
router.get("/previous-month", authMiddleware, getPreviousMonthReport);

// Update reading
router.put("/:id", authMiddleware, updateReading);

// Delete reading
router.delete("/:id", authMiddleware, deleteReading);

module.exports = router;
