const express = require("express");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = await UserModel.create({
      email,
      password,
      name,
    });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error registering user", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ message: "Login successful", user: userResponse });
  } catch (error) {
    res.status(400).json({ message: "Error logging in", error: error.message });
  }
});

module.exports = router;
