const jwt = require("jsonwebtoken");

const Restaurant = require("../Models/Restaurants");

const RestAuth = async (req, res, next) => {
    try {
      const token = req.header("Authorization").replace('Bearer ', '')
      console.log(token)
      const decoded = jwt.verify(token, process.env.RestTokenKey);
      const restaurant = await Restaurant.findOne({ _id: decoded._id, "tokens.token": token });
      if (!restaurant) {
        throw new Error();
      }  
      else{
      req.restaurant = restaurant;
      next();
  }
    } catch (e) {
      res.status(401).send({ error: e});
      next()
    }
  };
  module.exports = RestAuth;