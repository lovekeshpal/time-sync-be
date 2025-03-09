const mongoose = require("mongoose");

const TimerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  description: {
    type: String,
    default: "",
    maxlength: 200
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  duration: {
    type: Number, // Duration in seconds
    default: 300, // 5 minutes default (matching frontend)
  },
  isRunning: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  theme: {
    type: String,
    default: "light",
  },
  showMilliseconds: {
    type: Boolean,
    default: true,
  },
  startTime: {
    type: Date,
    default: null,
  },
  pausedAt: {
    type: Number, 
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