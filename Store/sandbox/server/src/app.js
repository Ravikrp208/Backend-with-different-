import express from "express";
// import dotenv from "dotenv";
import morgan from "morgan";



const app = express();

app.use(morgan("dev"));
app.use(express.json());


app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/sandbox/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "sandbox API is running",
  });
});

export default app;
