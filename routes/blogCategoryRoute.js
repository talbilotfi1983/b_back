const express = require('express');
const {createBCategory ,getBCategory, bcategories, updatebc, deleteBCategory} = require("../controller/blogCategoryCtrl");
const {authMiddlewares, isAdmin, isBlocked} = require('../middlewares/authMiddlewares');
const router = express.Router();
router.put("/:id", authMiddlewares, isAdmin, updatebc);
router.post("/add", authMiddlewares, isAdmin, createBCategory);
router.delete("/:id", authMiddlewares, isAdmin, deleteBCategory);
router.get("/all",  bcategories);
router.get("/:id",  getBCategory);

module.exports = router;