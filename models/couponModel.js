//coupon
const mongoose = require('mongoose');
const couponSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            unique: true,
            upperCase: true

        },
        expiry: {
            type: Date,
            required: true,
            default: Date.now()
        },
        discount: {type: Number, default: 30},
    },
    {timestamps: true}
);
module.exports = mongoose.model("Coupon", couponSchema);