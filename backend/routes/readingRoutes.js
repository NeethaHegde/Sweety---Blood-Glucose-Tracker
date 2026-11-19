
const express = require("express");
const router = express.Router();

const { addReading, getReadings, updateReading, deleteReading } = require("../controllers/readingController");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new glucose reading
router.post("/", authMiddleware, addReading);
// Get all glucose readings
router.get("/", authMiddleware, getReadings);
router.put("/:id", authMiddleware, updateReading );
router.delete("/:id", authMiddleware, deleteReading);


module.exports = router;
