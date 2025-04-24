require('dotenv').config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const jwt = require('jsonwebtoken'); // Add this
const Timer = require('./models/timer'); // Add this

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Origin settings for API and Socket.IO
const allowedOrigins = process.env.CORS_ORIGINS.split(',');

// CORS for Express
const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
});

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
  
  // Validate JWT token
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.user.id;
      console.log(`Authenticated user ${socket.userId}`);
    } catch (err) {
      console.error("Invalid socket auth token");
    }
  }

  // Map frontend's subscribeToTimer to joinTimer
  socket.on("subscribeToTimer", ({ timerId }) => {
    socket.join(timerId);
    console.log(`Client joined timer: ${timerId}`);
  });
  
  // Support subscribing to all user's timers
  socket.on("subscribeToUserTimers", async () => {
    if (!socket.userId) return;
    
    try {
      const timers = await Timer.find({ creator: socket.userId });
      timers.forEach(timer => {
        socket.join(timer.shareId);
        console.log(`User subscribed to timer: ${timer.shareId}`);
      });
    } catch (err) {
      console.error("Error subscribing to user timers:", err);
    }
  });
  
  // Support manual request for timer updates
  socket.on("requestTimerUpdates", async () => {
    if (!socket.userId) return;
    
    try {
      const timers = await Timer.find({ creator: socket.userId });
      timers.forEach(timer => {
        socket.emit("timerUpdate", timer);
      });
    } catch (err) {
      console.error("Error sending timer updates:", err);
    }
  });

  // Support original joinTimer/leaveTimer
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
