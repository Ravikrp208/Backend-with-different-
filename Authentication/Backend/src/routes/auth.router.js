const express = require("express");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const authMiddleware = require("../middleware/auth.middleware");

const authRouter = express.Router();

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "dev_jwt_secret",
    { expiresIn: "7d" }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 */
authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, password",
      });
    }

    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user already exists with this email address.",
      });
    }

    const user = await userModel.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const token = generateToken(user);

    // Set cookie
    res.cookie("jwt_token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during registration",
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 */
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password.",
      });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user);

    res.cookie("jwt_token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during login",
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get logged in user profile
 */
authRouter.get("/me", authMiddleware, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & clear cookie
 */
authRouter.post("/logout", (req, res) => {
  res.clearCookie("jwt_token");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully!",
  });
});

module.exports = authRouter;
