/**
 * server ka create karna 
 */

const express = require("express");
const app = express();
const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config();

app.use(express.json());

/**
 * POST 
 */

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/users", (req, res) => {
    
  res.send("Get All Users");
});

app.post("/api/users", (req, res) => {
    const user = {name , email, password} = req.body;   
    const user = new User({name , email, password});
    user.save()
    .then((user) => {
        res.status(201).json(user);
    })
    .catch((err) => {
        res.status(400).json({ message: err.message });
    });         
});

app.put("/api/users/:id", (req, res) => {

  res.send("Update User");
});

app.delete("/api/users/:id", (req, res) => {
  res.send("Delete User");
});

export default app;