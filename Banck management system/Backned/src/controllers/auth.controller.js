const userModel = require('../models/user.model');

/**
 * - user registration controller
 * - POST /api/auth/register
 */

async function  userRegistration(req, res) {
    const {email, password, name} = req.body

    const isExisting = await userModel.findOne({
        email: email});

if (isExisting){
    return res.status(422).json({
        message: "User already exists with this email",
        status: "failed"
    })

}
}

module.exports = {
    register: userRegistration
}