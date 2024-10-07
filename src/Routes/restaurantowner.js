const express = require("express");
const router = new express.Router();


const {Signup, Login} = require('../Controller/RestOwnerController')

router.post("/signup", Signup)
router.post("/login", Login)

module.exports = router