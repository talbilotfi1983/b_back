const express = require('express');
const {createGarage} = require('../controller/garageCtrl');
const router = express.Router();
router.post("/add", createGarage);
module.exports = router;
