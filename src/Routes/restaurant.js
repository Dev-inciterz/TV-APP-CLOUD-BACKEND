const express = require("express");
const router = new express.Router();

const { AddRestaurant} = require('../Controller/RestaurantController')

router.post("/add", AddRestaurant)

module.exports = router