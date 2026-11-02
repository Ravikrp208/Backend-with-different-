const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required for creating a user'],
        trim: true,
        unique: true,
        lowercase: true ,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],  
        unique: [true, 'Email already exists']     
    },
    password: {                                             
        type: String,
        required: [true, 'Password is required for creating a account'],
        minlength: [6, 'Password must be at least 6 characters long'] , 
        select: false 
    },
    name: {
        type: String,
        required: [true, 'Name is required for creating a account']
    }
});

module.exports = mongoose.model('User', userSchema);            