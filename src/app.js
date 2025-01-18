// filepath: /e:/Development/time-sync-be/src/app.js
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Enable CORS for specific clients
const corsOptions = {
  origin: ["http://localhost:4200"], // Add allowed origins here
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// Routes
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
app.use("/", indexRouter);
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
