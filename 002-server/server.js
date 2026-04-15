import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello Ravi Baby");
});

app.get("/home", (req, res) => {
  res.send("This is home page");
});

app.get("/about", (req, res) => {
  res.send("This is about page");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
