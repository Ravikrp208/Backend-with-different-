import express from "express";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello Ravi");
});

app.get("/home", (req, res) => {
  res.send("Welcome to Home Page");
});

app.get("/about", (req, res) => {
  res.send("Welcome to About Page");
});


app.get("/api/data",(req, res) => {
  const data = {
    message: "Hello from the backend!",
    timestamp: new Date(),
  };
  res.json(data);
 
});

app.get("/api/users", (req, res) => {
  const users = [
    { id: 1, name: "Ravi Kumar Pandit" },
    { id: 2, name: "Rani kumari" },
    { id: 3, name: "Shivam dost" },
  ];
  res.json(users);
});


export default app;
