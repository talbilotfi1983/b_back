const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: Number,
        required: true,
    },
    brand: {
        type: String,
        enum: ["Apple", "Samsung", "Lenovo"]
    },
    quantity: {
        type: Number,
        required: true
    },
    sold: {
        type: Number,
        default: 0
    },
    images: [],
    totalRatings: {
        type: Number,

    },
    color: {
        type: String,
        enum: ["Black", "Brown", "Red"]
    },
    ratings: [{
        star: Number,
        postedby: {type: mongoose.Schema.Types.ObjectId, red: "User"}
    }]
}, {timestamps: true});
module.exports = mongoose.model("Product", productSchema);