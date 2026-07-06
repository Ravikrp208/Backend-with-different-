import express from 'express';
import mogan from 'morgan';

const app = express();

app.use (mogan('dev'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
}); 