import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

app.get("/", (req, res) => {
  res.send("Hello Ravi Baby");
});

app.get("/home", (req, res) => {
  res.send("This is home page");
});

app.get("/about",(req,res)=>{
    res.send("This is about page")
})


export default app;