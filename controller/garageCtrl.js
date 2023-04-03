const Garage = require("../models/garageModel");
const asyncHandler = require("express-async-handler");
const createGarage = asyncHandler(async (req, res) => {
    const email = req.body.email_garage;
    console.log(email)
    const findGarage = await Garage.findOne({email_garage: email});
    if (!findGarage) {
        const garage = await Garage.create(req.body);
        res.json(garage);
    } else {
        throw new Error('Garage already exists');
    }
});
module.exports = {
    createGarage
};
