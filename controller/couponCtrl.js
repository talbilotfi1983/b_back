const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

const createCoupon = asyncHandler(async (req, res) => {
    const {title} = req.body;
    try {
        const findCoupon = await Coupon.findOneAndRemove({title: title})
        const coupon = await Coupon.create(req.body);
        res.json(coupon);
    } catch (e) {
        throw new Error(e);
    }
});

module.exports = {
    createCoupon
};