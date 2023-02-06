const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
crypto = require('crypto')
const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        require: true,
    },
    lastname: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    mobile: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
    },
    role: {
        type: String,
        default: 'user',
        require: true,
    },
    blocked: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
    },
    address: {
        type: String
    },
    passwordResetToken: String,
    passwordChangedAt: Date,
    passwordResetExpires: Date,
    cart: {
        type: Array,
        default: []
    },

    wishlist: [{type: mongoose.Schema.Types.ObjectId, ref: "Product"}],
}, {timestamps: true});
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
})
userSchema.methods.isPasswordMatched = async function (entredPassword) {
    return await bcrypt.compare(entredPassword, this.password);
}
userSchema.methods.createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    return resetToken;
}
module.exports = mongoose.model("User", userSchema);