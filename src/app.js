const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Enable CORS
app.use(cors());

// Routes
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
app.use("/", indexRouter);
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
