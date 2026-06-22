import express from 'express';

const app = express(); // server instance create karna

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello Ravi Baby",
        success: true,
    });

});

app.get("/home", (req, res) => {
    res.status(200).json({
        message: "This is home page",
        success: true,
    });
 
});

app.get("/api/data", (req, res) => {
    const data = {
        id: 1,
        name: "Ravi Baby",
        age: 25,
        department: "IT",
        description: "This is a sample data for API response",
    };
    res.status(200).json(data)
});

// server start karna
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});        