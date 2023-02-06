const express = require('express');
const {createCoupon} = require("../controller/couponCtrl");
const {authMiddlewares, isAdmin, isBlocked} = require('../middlewares/authMiddlewares');
const router = express.Router();
router.post("/add", authMiddlewares, isAdmin, createCoupon);

module.exports = router;