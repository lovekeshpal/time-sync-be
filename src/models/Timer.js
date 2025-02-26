const mongoose = require("mongoose");

const TimerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0,
  },
  isRunning: {
    type: Boolean,
    default: false,
  },
  startTime: {
    type: Date,
    default: null,
  },
  pausedAt: {
    type: Number, // Elapsed time when paused
    default: 0,
  },
  shareId: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Timer = mongoose.model("Timer", TimerSchema);

module.exports = Timer;
