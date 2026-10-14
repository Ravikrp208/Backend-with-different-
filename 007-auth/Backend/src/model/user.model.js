const mongoogqse = require("mongoose");

const userSchema = new mongoogqse.Schema({
    name: {
        name: String,
        email: String,
        password: String,

    }})                      

    const User = mongoogqse.model("User", userSchema);  