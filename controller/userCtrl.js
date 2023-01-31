const User = require("../models/userModel");
const {sendEmail} = require("./emailCtrl");
const {generateToken} = require("../config/jwtToken");
const {generateRefreshToken} = require("../config/refreshtoken");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const jwt = require("jsonwebtoken");
crypto = require('crypto')
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({email: email});
    if (!findUser) {
        const user = await User.create(req.body);
        res.json(user);
    } else {
        throw new Error('User already exists');
    }
});
const login = asyncHandler(async (req, res) => {
    console.log('login')
    const {email, password} = req.body;
    const findUser = await User.findOne({email: email});
    if (findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser._id);
        const updateUser = await User.findByIdAndUpdate(findUser._id, {
            refreshToken: refreshToken
        }, {new: true});
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000
        })
        res.json({
            _id: findUser._id,
            firstname: findUser.firstname,
            lastname: findUser.lastname,
            email: findUser.email,
            mobile: findUser.mobile,
            password: findUser.password,
            role: findUser.role,
            token: generateToken(findUser._id)
        });
    } else {
        throw new Error('Invalid credentials');
    }
});
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No refreshToken in cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken: refreshToken});
    if (user) {
        await User.findOneAndUpdate(refreshToken, {
            refreshToken: ""
        })
    }
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true
    });
    res.sendStatus(204);
});
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No refreshToken in cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if (!user) throw new Error('No refreshToken present in database');
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || decoded.id !== user.id) {
            throw new Error('There is somting wrong with refreshToken');
        }
        const accessToken = generateToken(user?.id)
        res.json({accessToken})
    })

});
const getUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find();
        res.json(users)
    } catch (e) {
        throw new Error(e);
    }

});
const getOneUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const user = await User.findById(id);
        if (user)
            res.json(user)
        else
            throw new Error('User not exist');
    } catch (e) {
        throw new Error('User not exist');
    }

});
const deleteUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const user = await User.findByIdAndDelete(id);
        res.json(user)
    } catch (e) {
        throw new Error(e);
    }

});
const updateUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const user = await User.findByIdAndUpdate(id,
            {
                firstname: req.body?.firstname,
                lastname: req.body?.lastname,
                email: req.body?.email,
                mobile: req.body?.mobile,
            }, {
                new: true
            }
        );
        res.json(user)
    } catch (e) {
        throw new Error(e);
    }
});
const blockUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const user = await User.findByIdAndUpdate(id,
            {
                blocked: true,
            }, {
                new: true
            }
        );
        res.json({message: 'User blocked'})
    } catch (e) {
        throw new Error(e);
    }
});
const unblockUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const user = await User.findByIdAndUpdate(id,
            {
                blocked: false,
            }, {
                new: true
            }
        );
        res.json({message: 'User unblocked'})
    } catch (e) {
        throw new Error(e);
    }
});
const updatePassword = asyncHandler(async (req, res) => {
    console.log('update')
    const {_id} = req.user;
    const {password} = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
});
const forgotPasswordToken = asyncHandler(async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if (!user) throw new Error('User not found whith this email');
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURl = `Hi, please follow this link to reset your password, This link is valid 10 mn from now <a href='http://localhost:5001/api/user/resetPassword/${token}'>Click here</a>`;
        const data = {
            to: email,
            subject: "Forgot password",
            htm: resetURl,
            text: 'Hey user'
        }
        sendEmail(data);
        res.json(token);
    } catch (e) {
        throw  new Error(e);
    }
});
const resetPassword = asyncHandler(async (req, res) => {
    const {password} = req.body;
    const {token} = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOneAndUpdate({
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now()),
    });
    if (!user) throw new Error("Token expired, please try againe later.");
    user.password = password;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save();
    res.send(user);
});
module.exports = {
    createUser,
    login,
    getUsers,
    getOneUser,
    deleteUser,
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword
};