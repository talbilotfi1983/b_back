const BCategory = require("../models/blogCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

const createBCategory = asyncHandler(async (req, res) => {
    try {
        const category = await BCategory.create(req.body);
        res.json(category);
    } catch (e) {
        throw new Error(e);
    }
});
const updatebc = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    console.log(id)
    try {
        const category = await BCategory.findByIdAndUpdate(id,
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

const deleteBCategory = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const category = await BCategory.findByIdAndDelete(id);
        res.json(category)
    } catch (e) {
        throw new Error(e);
    }
});
const getBCategory = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const category = await BCategory.findById(id);
        if (category)
            res.json(category)
        else
            throw new Error('BCategory not exist');
    } catch (e) {
        throw new Error('BCategory not exist');
    }
});
const bcategories = asyncHandler(async (req, res) => {
    const excludeFields = ["page", "sort", "limit", "fields"]
    let objQuery = {...req.query};
    excludeFields.forEach(e => delete objQuery[e])
    try {
        //important : BCategory.where("category").equals(req.query.category)
        //tri desc http://localhost:5001/api/category/all?sort=-price
        //tri asc http://localhost:5001/api/category/all?sort=price
        //tri avec plusieurs params http://localhost:5001/api/category/all?sort=price, category
        // fields selection des colones
        let fields = "-__v";
        let allBCategorys = BCategory.find(objQuery);
        if (req.query?.fields) {
            fields = req.query.fields?.split(",").join(' ');
        }
        allBCategorys.select(fields);
        let sortBy = "-createdAt";
        if (req.query?.sort) {
            sortBy = req.query.sort?.split(",").join(' ');
        }
        allBCategorys = allBCategorys.sort(sortBy);
        if (req.query?.page && req.query?.limit) {
            let page = req.query?.page;
            let limit = req.query?.limit;
            const skip = (--page) * limit;
            allBCategorys = allBCategorys.skip(skip).limit(limit);
            const countDocuments = await BCategory.countDocuments();
            if (skip >= countDocuments) throw new Error("This page doas not exist")
        }
        allBCategorys = await allBCategorys;
        res.json(allBCategorys)
    } catch (e) {
        throw new Error(e);
    }
});

module.exports = {
    createBCategory, getBCategory, bcategories, updatebc, deleteBCategory
};