const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const coordonneeSchema = new mongoose.Schema({
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
    role: {
        type: String,
        default: 'garage',
        require: true,
    },
    address: {
        type: String,
        require: true,
    },
    city: {
        type: String,
        require: true,
    },
    zip: {
        type: String,
        require: true,
        default: 92220
    },
    password: {
        type: String,
        require: true,
    },
    garage: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Garage'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    blocked: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
    },
    passwordResetToken: String,
    passwordChangedAt: Date,
    passwordResetExpires: Date,
}, {timestamps: true});
coordonneeSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
})
coordonneeSchema.methods.isPasswordMatched = async function (entredPassword) {
    return await bcrypt.compare(entredPassword, this.password);
}

coordonneeSchema.methods.createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    return resetToken;
}
module.exports = mongoose.model("Coordonnee", coordonneeSchema);
