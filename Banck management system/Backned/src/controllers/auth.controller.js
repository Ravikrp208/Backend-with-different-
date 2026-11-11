const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

/**
 * User Registration Controller
 * POST /api/auth/register
 */

async function userRegistration(req, res) {
  try {
    // 1. Get data from request body
    const { email, password, name } = req.body;

    // 2. Validate fields
    if (!email || !password || !name) {
      return res.status(400).json({
        message: "All fields are required",
        status: "failed",
      });
    }

    // 3. Check existing user
    const isExisting = await userModel.findOne({ email });

    if (isExisting) {
      return res.status(422).json({
        message: "User already exists with this email",
        status: "failed",
      });
    }

    // 4. Create user
    // Password hashing happens in User Model middleware
    const user = await userModel.create({
      email,
      password,
      name,
    });

    // 5. Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // 6. Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    // 7. Send response
    return res.status(201).json({
      message: "User registered successfully",
      status: "success",
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        token: token,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists",
        status: "failed",
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
      status: "failed",
    });
  }
}

module.exports = { userRegistration };
