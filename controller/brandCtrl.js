const Brand = require("../models/brandModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

const createBrand = asyncHandler(async (req, res) => {
    try {
        const brand = await Brand.create(req.body);
        res.json(brand);
    } catch (e) {
        throw new Error(e);
    }
});
const brands = asyncHandler(async (req, res) => {
    const excludeFields = ["page", "sort", "limit", "fields"]
    let objQuery = {...req.query};
    excludeFields.forEach(e => delete objQuery[e])
    try {
        //important : Brand.where("category").equals(req.query.category)
        //tri desc http://localhost:5001/api/Brand/all?sort=-price
        //tri asc http://localhost:5001/api/Brand/all?sort=price
        //tri avec plusieurs params http://localhost:5001/api/Brand/all?sort=price, category
        // fields selection des colones
        let fields = "-__v";
        let allBrands = Brand.find(objQuery);
        if (req.query?.fields) {
            fields = req.query.fields?.split(",").join(' ');
        }
        allBrands.select(fields);
        let sortBy = "-createdAt";
        if (req.query?.sort) {
            sortBy = req.query.sort?.split(",").join(' ');
        }
        allBrands = allBrands.sort(sortBy);
        if (req.query?.page && req.query?.limit) {
            let page = req.query?.page;
            let limit = req.query?.limit;
            const skip = (--page) * limit;
            allBrands = allBrands.skip(skip).limit(limit);
            const countDocuments = await Brand.countDocuments();
            if (skip >= countDocuments) throw new Error("This page doas not exist")
        }
        allBrands = await allBrands;
        res.json(allBrands)
    } catch (e) {
        throw new Error(e);
    }
});
const update = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const Brand = await Brand.findByIdAndUpdate(id,
            req.body
            , {
                new: true
            }
        );
        res.json(Brand)
    } catch (e) {
        throw new Error(e);
    }
});
const getBrand = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const brand = await Brand.findByIdAndUpdate(id,
            {
                $inc:
                    {numView: 1}
            },
            {
                new: true
            });
        if (brand)
            res.json(brand)
        else
            throw new Error('Brand not exist');
    } catch (e) {
        throw new Error('Brand not exist');
    }
});

const deleteBrand = asyncHandler(async (req, res) => {
    console.log('deleteBrand')
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const brand = await Brand.findByIdAndDelete(id);
        if (brand) {
            res.json(brand)
        } else {
            res.json({message: "Brand not found"})
        }

    } catch (e) {
        throw new Error(e);
    }
});

module.exports = {
    createBrand, brands, update, getBrand, deleteBrand
};