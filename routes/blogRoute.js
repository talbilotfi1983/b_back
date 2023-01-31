const express = require('express');
const {createBlog, blogs, update, getBlog, deleteBlog,likeBlog} = require("../controller/blogCtrl");
const {authMiddlewares, isAdmin, isBlocked} = require('../middlewares/authMiddlewares');
const router = express.Router();
router.put("/like", authMiddlewares, isAdmin, likeBlog);
router.put("/:id", authMiddlewares, isAdmin, update);
router.delete("/:id", authMiddlewares, deleteBlog);
router.get("/all", blogs);
router.get("/:id", getBlog);
router.post("/add", authMiddlewares, isAdmin, createBlog);

module.exports = router;