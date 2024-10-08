const express = require("express");
const router = new express.Router();
const OwnerAuth = require("../Middlewares/RestaurantOwnerAuth")

const { AddRestaurant} = require('../Controller/RestaurantController')

router.post("/add", OwnerAuth, AddRestaurant)

module.exports = router