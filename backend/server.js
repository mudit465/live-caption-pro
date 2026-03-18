import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import transcriptRoutes from "./routes/transcriptRoutes.js";

dotenv.config();

const app = express(); // ✅ FIRST create app
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("send-caption", ({ roomId, text }) => {
    socket.to(roomId).emit("receive-caption", text);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Middlewares
app.use(cors());
app.use(express.json());

// Routes ✅ (NOW CORRECT ORDER)
app.use("/api/ai", aiRoutes);
app.use("/api/transcripts", transcriptRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Live Caption Pro Backend Running");
});

// MongoDB connection
console.log("Connecting to MongoDB...");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Error:", error);
  });