const Product = require("../models/productModel");
const User = require("../models/userModel");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const {cloudinaryUloadImg} = require("../utils/cloudinary");
const {unlinkPromise} = require("../middlewares/uploadImages");
const fs = require("fs")

const createProduct = asyncHandler(async (req, res) => {
    const {title} = req.body;
    const findProduct = await Product.findOne({title: title});
    if (!findProduct) {
        req.body.slug = slugify(title);
        const product = await Product.create(req.body);
        res.json(product);
    } else {
        throw new Error('Product already exists');
    }
});
const getProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const product = await Product.findById(id);
        if (product)
            res.json(product)
        else
            throw new Error('Product not exist');
    } catch (e) {
        throw new Error('Product not exist');
    }
});
const products = asyncHandler(async (req, res) => {
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
        let allProducts = Product.find(objQuery);
        if (req.query?.fields) {
            fields = req.query.fields?.split(",").join(' ');
        }
        allProducts.select(fields);
        let sortBy = "-createdAt";
        if (req.query?.sort) {
            sortBy = req.query.sort?.split(",").join(' ');
        }
        allProducts = allProducts.sort(sortBy);
        if (req.query?.page && req.query?.limit) {
            let page = req.query?.page;
            let limit = req.query?.limit;
            const skip = (--page) * limit;
            allProducts = allProducts.skip(skip).limit(limit);
            const countDocuments = await Product.countDocuments();
            if (skip >= countDocuments) throw new Error("This page doas not exist")
        }
        allProducts = await allProducts;
        res.json(allProducts)
    } catch (e) {
        throw new Error(e);
    }
});
const update = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const product = await Product.findByIdAndUpdate(id,
            {
                title: req.body?.title,
                description: req.body?.description,
                price: req.body?.price,
                quantity: req.body?.quantity,
                slug: slugify(req.body?.title)
            }, {
                new: true
            }
        );
        res.json(product)
    } catch (e) {
        throw new Error(e);
    }
});
const deleteProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const product = await Product.findByIdAndDelete(id);
        res.json(product)
    } catch (e) {
        throw new Error(e);
    }
});
const addToWishlist = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    const {id} = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyAdd = user.wishlist.find(idw => idw.toString() === id.toString());
        data = alreadyAdd ?
            {$pull: {wishlist: id}} :
            {$push: {wishlist: id}};
        let u = await User.findByIdAndUpdate(_id, data, {new: true}).populate("wishlist");
        res.json(u)
    } catch (e) {
        throw new Error(e);
    }
});

const rating = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    const {star, id} = req.body;
    try {
        //const user = await User.findById(_id);
        const product = await Product.findById(id);
        const alreadyRating = product.ratings?.find(userPosted => userPosted.postedby.toString() === _id.toString());
        let u;
        if (alreadyRating) {
            u = await Product.updateOne({
                    ratings: {$elemMatch: alreadyRating}
                }, {
                    $set: {
                        "ratings.$.star": star
                    }
                }
                , {new: true});
        } else {
            u = await Product.findByIdAndUpdate(id, {$push: {ratings: {star: star, postedby: _id}}}, {new: true});
        }
        const allRetings = await Product.findById(id);
        let actualRatings = 0;
        if (allRetings.ratings?.length > 0) {
            const sum = allRetings.ratings?.map(e => e.star).reduce((e, e1) => e + e1, 0);
            actualRatings = Math.round(sum / allRetings.ratings?.length)
        }
        const productRating = await Product.findByIdAndUpdate(id, {totalRatings: actualRatings}, {new: true});
        res.json(productRating);
    } catch (e) {
        throw new Error(e);
    }
});
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
            console.log(path)
            //unlinkPromise(path)
        }
        const findProduct = await Product.findByIdAndUpdate(id, {
                images: urls.map(file => {
                    return file
                })
            },
            {new: true})
        // await unlinkPromise(url)
        res.json(findProduct);
    } catch (e) {
        throw new Error(e);
    }
});
module.exports = {
    createProduct, getProduct, products, update, deleteProduct, addToWishlist, rating, uploadImages
};