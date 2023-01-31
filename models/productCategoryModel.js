const mongoose = require('mongoose');
const pcategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
}, {timestamps: true});
module.exports = mongoose.model("PCategory", pcategorySchema);