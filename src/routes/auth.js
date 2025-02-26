const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Signup route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ code: 1, msg: "Username already exists" });
    }

    user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        code: 2,
        msg: "Email already associated with another account",
      });
    }

    user = new User({ username, email, password });
    await user.save();
    const payload = { user: { id: user.id } };
    jwt.sign(payload, "secret", { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 3, msg: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ code: 4, msg: "Invalid credentials" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ code: 5, msg: "Invalid credentials" });
    }
    const payload = { user: { id: user.id } };
    jwt.sign(payload, "secret", { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ code: 3, msg: "Server error" });
  }
});

module.exports = router;
