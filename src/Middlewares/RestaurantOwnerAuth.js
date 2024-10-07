const jwt = require("jsonwebtoken");
const RestaurantOwner = require("../Models/RestaurantOwner");
const RestaurantOwnerAuth = async (req, res, next) => {
  try {
    
    if(req.header("Authorization")){
      const token = req.header("Authorization").replace('Bearer ', '')
      const decoded = jwt.verify(token, process.env.RestaurantOwnerTokenKey);
      const restowner = await RestaurantOwner.findOne({ _id: decoded._id, "tokens.token": token });
      if (!restowner) {
        throw new Error();
      }
      else{
      req.restowner = restowner;
      next();
  }

    }
    else{
      res.status(400).json({
        message:"please provide token or You don't have the Access"
      })
    }
   
  } catch (e) {
    res.status(401).json({ error:e.message }); // to be commeted (in future)
    next()
  }
};
module.exports = RestaurantOwnerAuth;