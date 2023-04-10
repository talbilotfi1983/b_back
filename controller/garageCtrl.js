const Garage = require("../models/garageModel");
const Coordonnee = require("../models/coordonneeModel");
const asyncHandler = require("express-async-handler");
const {cloudinaryUloadImg} = require("../utils/cloudinary");
const validateMongoDbId = require("../utils/validateMongodbid");
const Product = require("../models/productModel");
const uploadImages = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const uploader = (path) => cloudinaryUloadImg(path, 'images');
        const urls = [];
        const files = req.files;
        for (const file of files) {
            const {path} = file;
            const newpath = await uploader(path);
            urls.push(newpath);
        }
        const findGarage = await Garage.findByIdAndUpdate(id, {
                logo: urls[0].url
            },
            {new: true})
        res.json(findGarage);
    } catch (e) {
        throw new Error(e);
    }
});
const createGarage = asyncHandler(async (req, res) => {
    const {email} = req.body;
    const findCoordonnee = await Coordonnee.findOne({email});
    if (!findCoordonnee) {
        const {name, intervention_address, logo, observation, price, tire_size} = req.body;
        const infosGarage = {
            name,
            intervention_address,
            logo,
            observation,
            price,
            tire_size
        }
        const garage = await Garage.create(infosGarage);
        const {email, mobile, address, city, zip, password} = req.body;
        const infosCoordonnee = {
                email, mobile, address, city, zip, password,
                garage: garage._id
            }
        ;
        let newCoodonnee = await Coordonnee.create(infosCoordonnee);
        newCoodonnee = await newCoodonnee.populate("garage")

        res.json(newCoodonnee);
    } else {
        throw new Error('Garage already exists');
    }
});
const coordonneeGarages = asyncHandler(async (req, res) => {
    const excludeFields = ["page", "sort", "limit", "fields"]
    let objQuery = {...req.query};
    excludeFields.forEach(e => delete objQuery[e])
    try {
        //important : Product.where("category").equals(req.query.category)
        //tri desc http://localhost:5001/api/product/all?sort=-price
        //tri asc http://localhost:5001/api/product/all?sort=price
        //tri avec plusieurs params http://localhost:5001/api/product/all?sort=price, category
        // fields selection des colones
        let fields = "-__v";
        let allCoordonnee = Coordonnee.find(objQuery).where("role").equals('garage');
        if (req.query?.fields) {
            fields = req.query.fields?.split(",").join(' ');
        }
        allCoordonnee.select(fields);
        let sortBy = "-createdAt";
        if (req.query?.sort) {
            sortBy = req.query.sort?.split(",").join(' ');
        }
        allCoordonnee = allCoordonnee.sort(sortBy);
        if (req.query?.page && req.query?.limit) {
            let page = req.query?.page;
            let limit = req.query?.limit;
            const skip = (--page) * limit;
            allCoordonnee = allCoordonnee.skip(skip).limit(limit);
            const countDocuments = await Coordonnee.countDocuments();
            if (skip >= countDocuments) throw new Error("This page doas not exist")
        }
        allCoordonnee = await allCoordonnee.populate('garage');
        res.json(allCoordonnee)
    } catch (e) {
        throw new Error(e);
    }
});
module.exports = {
    createGarage, uploadImages, coordonneeGarages
};
