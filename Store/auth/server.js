import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from auth service");
}   
);
app.listen(3000, () => {
  console.log("Auth service is running on port 3000");
}); 
