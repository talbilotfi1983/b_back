const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

const createBlog = asyncHandler(async (req, res) => {
    console.log('createBlog')

    try {
        const blog = await Blog.create(req.body);
        res.json(blog);
    } catch (e) {
        throw new Error(e);
    }
});
const blogs = asyncHandler(async (req, res) => {
    console.log('blogs')

    const excludeFields = ["page", "sort", "limit", "fields"]
    let objQuery = {...req.query};
    excludeFields.forEach(e => delete objQuery[e])
    try {
        //important : Blog.where("category").equals(req.query.category)
        //tri desc http://localhost:5001/api/Blog/all?sort=-price
        //tri asc http://localhost:5001/api/Blog/all?sort=price
        //tri avec plusieurs params http://localhost:5001/api/Blog/all?sort=price, category
        // fields selection des colones
        let fields = "-__v";
        let allBlogs = Blog.find(objQuery);
        if (req.query?.fields) {
            fields = req.query.fields?.split(",").join(' ');
        }
        allBlogs.select(fields);
        let sortBy = "-createdAt";
        if (req.query?.sort) {
            sortBy = req.query.sort?.split(",").join(' ');
        }
        allBlogs = allBlogs.sort(sortBy);
        if (req.query?.page && req.query?.limit) {
            let page = req.query?.page;
            let limit = req.query?.limit;
            const skip = (--page) * limit;
            allBlogs = allBlogs.skip(skip).limit(limit);
            const countDocuments = await Blog.countDocuments();
            if (skip >= countDocuments) throw new Error("This page doas not exist")
        }
        allBlogs = await allBlogs;
        res.json(allBlogs)
    } catch (e) {
        throw new Error(e);
    }
});
const update = asyncHandler(async (req, res) => {
    console.log('update')

    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const Blog = await Blog.findByIdAndUpdate(id,
            req.body
            , {
                new: true
            }
        );
        res.json(Blog)
    } catch (e) {
        throw new Error(e);
    }
});
const getBlog = asyncHandler(async (req, res) => {
    console.log('getBlog')

    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const blog = await Blog.findByIdAndUpdate(id,
            {
                $inc:
                    {numView: 1}
            },
            {
                new: true
            });
        if (blog)
            res.json(blog)
        else
            throw new Error('Blog not exist');
    } catch (e) {
        throw new Error('Blog not exist');
    }
});


const deleteBlog = asyncHandler(async (req, res) => {
    console.log('deleteBlog')
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const blog = await Blog.findByIdAndDelete(id);
        if (blog) {
            res.json(blog)
        } else {
            res.json({message: "Blog not found"})
        }

    } catch (e) {
        throw new Error(e);
    }
});
const likeBlog = asyncHandler(async (req, res) => {
    const {id} = req.body;
    let blog = await Blog.findById(id);
    const id_user = req.user?._id;
    const isLiked = blog?.isLiked;
    const alreadyDisliked = blog.dislikes.find(id => {
        id.toString() === id_user.toString()
    })
    data = {};
    if (alreadyDisliked) {
        data = {
            $pull: {dislikes: id_user},
            isDisliked: false
        };
    } else if (isLiked) {
        data = {
            $pull: {likes: id_user},
            isLiked: false
        };
    } else {
        data = {
            $push: {likes: id_user},
            isLiked: true
        };
    }
    blog = await Blog.findByIdAndUpdate(id,
        data, {new: true}).populate('likes')
        .populate('dislikes');
    res.json(blog)
});

module.exports = {
    createBlog, blogs, update, getBlog, deleteBlog, likeBlog
};