const mongoose = require('mongoose');
const bcategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
}, {timestamps: true});
module.exports = mongoose.model("BCategory",bcategorySchema);