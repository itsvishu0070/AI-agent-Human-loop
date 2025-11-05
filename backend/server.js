import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import requestRoutes from "./routes/requestRoutes.js";
import tokenRoutes from "./routes/tokenRoutes.js";
import startTimeoutHandler from "./services/timeoutHandler.js";
import startLiveKitAgent from "./services/livekitAgent.js";

// Load .env variables
dotenv.config();

// Connect to MongoDB
connectDB();

startTimeoutHandler();

try {
  startLiveKitAgent();
  console.log(" LiveKit Voice Agent started successfully!");
} catch (error) {
  console.error("LiveKit Agent failed to start:", error.message);
  console.log(" Make sure your LiveKit credentials are correct in .env file");
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
); 
app.use(express.json()); 

// Simple test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running",
    timestamp: new Date(),
  });
});

app.use("/api/requests", requestRoutes);
app.use("/api", tokenRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
