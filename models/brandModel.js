const mongoose = require('mongoose');
//marque
const brandSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    }

}, {timestamps: true}
);
module.exports = mongoose.model("brand", brandSchema);