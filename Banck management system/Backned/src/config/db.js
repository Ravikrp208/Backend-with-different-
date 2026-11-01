const mongoose = require ("mongoose")




function connectDB(){
    mongoose.connect(process.env.MONGO_UURI)
}

module.exports = connectDB
