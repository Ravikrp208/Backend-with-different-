const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const authRouter = require("./routes/auth.router");

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:5000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base health check route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Authentication Backend API is running smoothly 🚀",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      profile: "GET /api/auth/me",
      logout: "POST /api/auth/logout",
    },
  });
});

// Routes
app.use("/api/auth", authRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

module.exports = app;
