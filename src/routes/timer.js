// src/routes/timer.js
const express = require("express");
const router = express.Router();
const Timer = require("../models/timer");
const auth = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

// Create a new timer
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, duration, isPublic, theme } = req.body;

    const timer = new Timer({
      name,
      description,
      duration: duration || 0,
      isPublic,
      theme,
      creator: req.user.id,
      shareId: uuidv4(),
    });

    await timer.save();
    res.json(timer);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 3, msg: "Server error" });
  }
});

// Get user's timers
router.get("/", auth, async (req, res) => {
  try {
    const timers = await Timer.find({ creator: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(timers);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 3, msg: "Server error" });
  }
});

// Get timer by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const timer = await Timer.findById(req.params.id);

    if (!timer) {
      return res.status(404).json({ msg: "Timer not found" });
    }

    // Check if timer belongs to user or if it's a shared timer being accessed
    if (timer.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    res.json(timer);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 3, msg: "Server error" });
  }
});

// Get public timer by shareId
router.get("/share/:shareId", async (req, res) => {
  try {
    const timer = await Timer.findOne({ shareId: req.params.shareId });

    if (!timer) {
      return res.status(404).json({ msg: "Timer not found" });
    }

    res.json(timer);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 3, msg: "Server error" });
  }
});

// Start timer
router.put("/start/:id", auth, async (req, res) => {
  try {
    const timer = await Timer.findById(req.params.id);

    if (!timer) {
      return res.status(404).json({ msg: "Timer not found" });
    }

    if (timer.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    timer.isRunning = true;
    timer.startTime = new Date();

    await timer.save();

    // Emit real-time update with Socket.IO
    const io = req.app.get("io");
    io.to(timer.shareId).emit("timerUpdate", timer);

    res.json(timer);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 3, msg: "Server error" });
  }
});

// Pause timer
router.put("/pause/:id", auth, async (req, res) => {
  try {
    const timer = await Timer.findById(req.params.id);

    if (!timer) {
      return res.status(404).json({ msg: "Timer not found" });
    }

    if (timer.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    if (timer.isRunning) {
      const currentTime = new Date();
      const elapsedTime = Math.floor((currentTime - timer.startTime) / 1000);
      timer.pausedAt = timer.pausedAt + elapsedTime;
    }

    timer.isRunning = false;

    await timer.save();

    // Emit real-time update with Socket.IO
    const io = req.app.get("io");
    io.to(timer.shareId).emit("timerUpdate", timer);

    res.json(timer);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 3, msg: "Server error" });
  }
});

// Reset timer
router.put("/reset/:id", auth, async (req, res) => {
  try {
    const timer = await Timer.findById(req.params.id);

    if (!timer) {
      return res.status(404).json({ msg: "Timer not found" });
    }

    if (timer.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    timer.isRunning = false;
    timer.startTime = null;
    timer.pausedAt = 0;

    await timer.save();

    // Emit real-time update with Socket.IO
    const io = req.app.get("io");
    io.to(timer.shareId).emit("timerUpdate", timer);

    res.json(timer);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 3, msg: "Server error" });
  }
});

module.exports = router;
