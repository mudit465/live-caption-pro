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

const app = express();
const server = http.createServer(app);


// ✅ CORS FIX (FINAL)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://bucolic-llama-bfb205.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ FIXED
    credentials: true,
  })
);

app.use(express.json());


// ✅ SOCKET.IO FIX (FINAL)
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://bucolic-llama-bfb205.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ FIXED
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User connected");

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`📌 User joined room: ${roomId}`);
  });

  socket.on("send-caption", ({ roomId, text }) => {
    socket.to(roomId).emit("receive-caption", text);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
  });
});


// ✅ ROUTES
app.use("/api/ai", aiRoutes);
app.use("/api/transcripts", transcriptRoutes);
app.use("/api/auth", authRoutes);


// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("🚀 Live Caption Pro Backend Running");
});


// ✅ MONGODB CONNECTION
console.log("Connecting to MongoDB...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    server.listen(process.env.PORT || 5000, () => {
      console.log(
        `🚀 Server running on port ${process.env.PORT || 5000}`
      );
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Error:", error);
  });