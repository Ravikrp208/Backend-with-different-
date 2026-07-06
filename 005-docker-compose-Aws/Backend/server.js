import express from 'express';
import morgan from 'morgan';


const app = express();
app.use(morgan('dev'));

app.get('/', (req, res) => 
res.status(200).json({
    message: 'Welcome to the backend server!',
  })            
);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "API is healthy",
    });
});

app.get("/api/hello", (req, res) => {
    res.status(200).json({
        message: "Hello from the backend!",
    });
});

app.get('/api/users', (req, res) => {
    const users=
 [
    { id: 1, name: 'Shivam kumar ' },
    { id: 2, name: 'Manish kumar ' },
    { id: 3, name: 'Rupesh kumar ' }
  ];
    res.json(users);
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
})