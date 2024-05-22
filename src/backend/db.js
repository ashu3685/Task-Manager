const mongoose = require('mongoose');

// Connected to mongodb server

mongoose.connect("mongodb://127.0.0.1:27017/project")
.then(() => console.log("Connection Successfull"))
.catch((err) => console.log(err));


// Schema Creation

const user_Schema = mongoose.Schema({
    name: String,
    password: String,
    email: String,
    PhoneNo: Number,
    tasks:[{
            todo: String,
        },]
})

// Model Creation
const User = mongoose.model('User', user_Schema);
module.exports = User;