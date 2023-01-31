const express = require('express');
const {createBrand, brands, update, getBrand, deleteBrand} = require("../controller/brandCtrl");
const {authMiddlewares, isAdmin, isBlocked} = require('../middlewares/authMiddlewares');
const router = express.Router();
router.put("/:id", authMiddlewares, isAdmin, update);
router.delete("/:id", authMiddlewares, deleteBrand);
router.get("/all", brands);
router.get("/:id", getBrand);
router.post("/add", authMiddlewares, isAdmin, createBrand);
module.exports = router;