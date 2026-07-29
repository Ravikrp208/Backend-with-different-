const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.jwt_token;

    // Check Authorization header if cookie not present
    if (!token && req.headers.authorization) {
      if (req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      } else {
        token = req.headers.authorization;
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_jwt_secret");
    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;
