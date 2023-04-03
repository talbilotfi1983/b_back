const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const garageSchema = new mongoose.Schema({
    nom_garage: {
        type: String,
        require: true,
    },
    ville_garage: {
        type: String,
        require: true,
    },
    adresse_garage: {
        type: String,
        require: true,
        unique: true,
    },
    telephone_garage: {
        type: String,
        require: true,
        unique: true,
    },
    email_garage: {
        type: String,
        require: true,
    },
    lieu_intervation_garage: {
        type: String,
        require: true,
    },
    logo_garage: {
        type: String,
        require: true,
    },
    observation: {
        type: String,
        require: true,
    },
    prix_garage: {
        type: Number,
        require: true,
    },
    diametre_pneu: {
        type: String,
        require: true,
    },
    mot_de_passe: {
        type: String,
        require: true,
    },
    passwordResetToken: String,
    passwordChangedAt: Date,
    passwordResetExpires: Date,
}, {timestamps: true});
garageSchema.pre("save", async function (next) {
    if (!this.isModified("mot_de_passe")) {
        next();
    }
    const salt = await bcrypt.genSaltSync(10);
    this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, salt);
})
garageSchema.methods.isPasswordMatched = async function (entredPassword) {
    return await bcrypt.compare(entredPassword, this.mot_de_passe);
}
module.exports = mongoose.model("Garage", garageSchema);
