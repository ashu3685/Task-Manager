const mongoose = require('mongoose');

// Connected to mongodb server
mongoose.connect("mongodb+srv://himanshusharma16112:Himanshu%4016112@w3villa.rawaai3.mongodb.net/?retryWrites=true&w=majority&appName=w3villa")
.then(() => console.log("Connection Successful"))
.catch((err) => console.log(err));


// Schema Creation

const userSchema = mongoose.Schema({
    name: String,
    password: String,
    email: String,
    PhoneNo: Number,
    tasks:[{
            todo: String,
        },]
})

// Model Creation
const User = mongoose.model('User', userSchema);
module.exports = User;
