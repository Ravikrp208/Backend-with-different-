const  express = require('express');
const userModel = require("../model/user.model.js");



const authRouter = express.Router();


authRouter.post('/register', async (req, res) => {
    const { name, email, password } = req.body



    const isUserAlreadyExist = await userModel.findOne({ email });
    if (isUserAlreadyExist) {
        return res.status(400).json(
            {
                message: "User already exist with this email"
            }
        );
    }   


    const user = await userModel.create({ name, email, password });
    res.status(201).json(
        {
            message: "User registered successfully",
            user: user
        }
    );
})            

module.exports = authRouter;
