const express = require('express');
const {createPCategory ,getPCategory, pcategories, update, deletePCategory} = require("../controller/productCategoryCtrl");
const {authMiddlewares, isAdmin, isBlocked} = require('../middlewares/authMiddlewares');
const router = express.Router();
router.put("/:id", authMiddlewares, isAdmin, update);
router.post("/add", authMiddlewares, isAdmin, createPCategory);
router.delete("/:id", authMiddlewares, isAdmin, deletePCategory);
router.get("/all",  pcategories);
router.get("/:id",  getPCategory);

module.exports = router;