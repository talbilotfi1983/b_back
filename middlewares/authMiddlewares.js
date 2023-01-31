const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const authMiddlewares = asyncHandler(async (req, res, next) => {
    let token;
    console.log('authMiddlewares')
    if (req.headers?.authorization?.startsWith('Bearer')) {
        token = req?.headers?.authorization?.split(" ")[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log('authMiddlewares ok')
                const user = await User.findById(decoded?.id)
                req.user = user;
                next();
            }
        } catch (e) {
            throw new Error('Authorized token expired, please login again');
        }
    } else {
        throw new Error('There is no token attached to header');
    }
});
const isAdmin = asyncHandler(async (req, res, next) => {
    console.log('isAdmin')
    const {email} = req.user;
    const adminUser = await User.findOne({email: email});
    if (adminUser.role !== 'admin') {
        throw new Error('User not authorised, you are not admin');
    } else {
        console.log('isAdmin ok')
        next();
    }
});
const isBlocked = asyncHandler(async (req, res, next) => {
    const {email} = req.user;
    const adminUser = await User.findOne({email: email});
    if (adminUser.blocked) {
        throw new Error('User not authorised, you are blocked');
    } else {
        next();
    }
});
module.exports = {authMiddlewares, isAdmin, isBlocked}