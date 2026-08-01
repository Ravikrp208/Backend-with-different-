import express from "express";
import cors from "cors";
import catRoutes from "./routes/cat.routes.js";
import battleRoutes from "./routes/battle.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";

const app = express();

// Middlewares
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());

// API Status & Welcome Endpoint
app.get("/api", (req, res) => {
  res.json({
    status: "ONLINE",
    name: "AI Cat Bot Battle Arena API",
    version: "1.0.0",
    endpoints: {
      cats: "/api/cats",
      aiCatGenerator: "POST /api/cats/generate-ai",
      startBattle: "POST /api/battles/start",
      executeTurn: "POST /api/battles/:battleId/turn",
      simulateFullBattle: "POST /api/battles/simulate",
      leaderboard: "/api/leaderboard"
    }
  });
});

// API Routes
app.use("/api/cats", catRoutes);
app.use("/api/battles", battleRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Backend Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
});

export default app;
