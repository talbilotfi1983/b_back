const express = require('express');
const {createGarage, coordonneeGarages} = require('../controller/garageCtrl');
const {uploadPhoto, productImgResize} = require("../middlewares/uploadImages");
const {uploadImages} = require("../controller/garageCtrl");
const router = express.Router();
router.post("/add", createGarage);
router.put("/upload/:id", uploadPhoto.array("images", 10), productImgResize, uploadImages);
router.get("/coordonneeGarages", coordonneeGarages);

module.exports = router;
