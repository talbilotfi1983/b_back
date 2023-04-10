const mongoose = require('mongoose');
crypto = require('crypto')
const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        require: true,
    },
    lastname: {
        type: String,
        require: true,
    }
}, {timestamps: true});

module.exports = mongoose.model("User", userSchema);
