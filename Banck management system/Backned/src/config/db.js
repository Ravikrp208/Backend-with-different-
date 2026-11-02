const mongoose = require ("mongoose")




function connectDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then (()=>{
        console.log("Database connected successfully")  
        process.exit(0)

        .catch((err)=>{
            console.log("Database connection failed")
            process.exit(1)
        })
    })
}

module.exports = connectDB
