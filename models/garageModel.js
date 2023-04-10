const mongoose = require('mongoose');
const garageSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true,
    },
    intervention_address: {
        type: String,
        require: true,
    },
    logo: {
        type: String,
        require: true,
    },
    observation: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
        require: true,
    },
    tire_size: {
        type: String,
        require: true,
    }
}, {timestamps: true});
module.exports = mongoose.model("Garage", garageSchema);
