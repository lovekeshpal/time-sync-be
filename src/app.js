require('dotenv').config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins during testing
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Enable CORS for specific clients
const corsOptions = {
  origin: [process.env.CORS_ORIGINS.split(',')],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Routes
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const timerRouter = require("./routes/timer");

app.use("/", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/timer", timerRouter);

// Socket.IO connections
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinTimer", (timerId) => {
    socket.join(timerId);
    console.log(`Client joined room: ${timerId}`);
  });

  socket.on("leaveTimer", (timerId) => {
    socket.leave(timerId);
    console.log(`Client left room: ${timerId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Make io accessible in routes
app.set("io", io);

const PORT = process.env.PORT || 3000;
// Change app.listen to server.listen to use Socket.IO
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
