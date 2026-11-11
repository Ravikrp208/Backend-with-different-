const express = require("express");
const authRouter = require("./routes/auth.router");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();


app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);

module.exports = app;
