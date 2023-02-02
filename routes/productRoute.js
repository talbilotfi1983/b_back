const express = require('express');
const {createProduct, getProduct, products, update, deleteProduct, addToWishlist, rating, uploadImages} = require("../controller/productCtrl");
const {authMiddlewares, isAdmin, isBlocked} = require('../middlewares/authMiddlewares');
const {uploadPhoto, productImgResize} = require('../middlewares/uploadImages');
const router = express.Router();

router.get("/all", products);
router.get("/:id", getProduct);
router.put("/addToWishlist", authMiddlewares, addToWishlist);
router.put("/rating", authMiddlewares, isAdmin, rating);
router.put("/upload/:id", authMiddlewares, isAdmin, uploadPhoto.array("images", 10), productImgResize, uploadImages);
router.put("/:id", authMiddlewares, isAdmin, update);
router.delete("/:id", authMiddlewares, isAdmin, deleteProduct);
router.post("/add", authMiddlewares, isAdmin, createProduct);

module.exports = router;