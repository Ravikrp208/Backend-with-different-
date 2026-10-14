const  express = require('express');
const authRouter = express.Router();


authRouter.post('/register', async (req, res) => {
    const { name, email, password } = req.body;     
})            

module.exports = authRouter;
