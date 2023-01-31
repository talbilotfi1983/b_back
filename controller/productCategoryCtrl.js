const PCategory = require("../models/productCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

const createPCategory = asyncHandler(async (req, res) => {
    try {
        const category = await PCategory.create(req.body);
        res.json(category);
    } catch (e) {
        throw new Error(e);
    }
});
const update = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const category = await PCategory.findByIdAndUpdate(id,
            req.body, {
                new: true
            }
        );
        if (category)
        res.json(category)
        else
            throw new Error('category product not exist');

    } catch (e) {
        throw new Error(e);
    }
});

const deletePCategory = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const category = await PCategory.findByIdAndDelete(id);
        res.json(category)
    } catch (e) {
        throw new Error(e);
    }
});
const getPCategory = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const category = await PCategory.findById(id);
        if (category)
            res.json(category)
        else
            throw new Error('PCategory not exist');
    } catch (e) {
        throw new Error('PCategory not exist');
    }
});
const pcategories = asyncHandler(async (req, res) => {
    const excludeFields = ["page", "sort", "limit", "fields"]
    let objQuery = {...req.query};
    excludeFields.forEach(e => delete objQuery[e])
    try {
        //important : PCategory.where("category").equals(req.query.category)
        //tri desc http://localhost:5001/api/category/all?sort=-price
        //tri asc http://localhost:5001/api/category/all?sort=price
        //tri avec plusieurs params http://localhost:5001/api/category/all?sort=price, category
        // fields selection des colones
        let fields = "-__v";
        let allPCategorys = PCategory.find(objQuery);
        if (req.query?.fields) {
            fields = req.query.fields?.split(",").join(' ');
        }
        allPCategorys.select(fields);
        let sortBy = "-createdAt";
        if (req.query?.sort) {
            sortBy = req.query.sort?.split(",").join(' ');
        }
        allPCategorys = allPCategorys.sort(sortBy);
        if (req.query?.page && req.query?.limit) {
            let page = req.query?.page;
            let limit = req.query?.limit;
            const skip = (--page) * limit;
            allPCategorys = allPCategorys.skip(skip).limit(limit);
            const countDocuments = await PCategory.countDocuments();
            if (skip >= countDocuments) throw new Error("This page doas not exist")
        }
        allPCategorys = await allPCategorys;
        res.json(allPCategorys)
    } catch (e) {
        throw new Error(e);
    }
});

module.exports = {
    createPCategory, getPCategory, pcategories, update, deletePCategory
};