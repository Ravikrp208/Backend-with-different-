const mongoose = require("mongoose");

function connectToDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/auth_db";
  mongoose
    .connect(uri)
    .then(() => {
      console.log("Connected to MongoDB successfully!");
    })
    .catch((err) => {
      console.error("MongoDB Connection Error:", err.message);
    });
}

module.exports = connectToDB;
