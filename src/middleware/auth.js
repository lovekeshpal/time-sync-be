// src/middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from Authorization header
  const authHeader = req.header("Authorization");

  // Check if no auth header
  if (!authHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Check for Bearer token format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Invalid token format" });
  }

  // Extract the token from the Bearer string
  const token = authHeader.substring(7, authHeader.length); // Remove "Bearer " prefix

  // Verify token
  try {
    const decoded = jwt.verify(token, "secret");
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
