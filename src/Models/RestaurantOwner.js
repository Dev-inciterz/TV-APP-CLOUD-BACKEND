const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const RestaurantOwnerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  avatar:{
    type:String
  },
  restaurants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant' // Reference to the restaurants owned by this owner
    }
  ],
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
}, { timestamps: true });


// Method for generating the Auth Token which is being called by the function of login and signup from Router files
RestaurantOwnerSchema.methods.generateAuthToken = async function () {
    const restowner = this;
    const token = jwt.sign({ _id: restowner._id }, process.env.RestaurantOwnerTokenKey);
    restowner.tokens = restowner.tokens.concat({ token });
    await restowner.save();
    console.log(token); // consoling the token
    return token;
  };
  
  // Finding the RestaurantOwner by its credentials and checking the password with our hashed one
  RestaurantOwnerSchema.statics.findByCredentials = async (email, password) => {
      const restowner = await RestaurantOwner.findOne({ email });
      // console.log("jcbdhjeceh", RestaurantOwner);
    
      if (!restowner) {
        throw new Error("Looks like you're not registered yet! Ready to join us? Sign up now and Expand Your Brand Demand!");
      }
    
      const isMatch = await bcrypt.compare(password, restowner.password);
    
      if (!isMatch) {
        throw new Error("Password didn't Match");
      }
      return restowner;
    };
  
    RestaurantOwnerSchema.pre("save", async function (next) {
    const RestaurantOwner = this;
  
    if (RestaurantOwner.isModified("password")) {
      RestaurantOwner.password = await bcrypt.hash(RestaurantOwner.password, 8);
    }
  
    next();
  });

const RestaurantOwner = mongoose.model('RestaurantOwner', RestaurantOwnerSchema);
module.exports = RestaurantOwner;
