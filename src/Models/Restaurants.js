const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const RestaurantSchema = new mongoose.Schema({
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

  website: {
    type: String,
  },

    location: {
      type: String,
      // required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantOwner', // Reference to the restaurant owner
      required: true
    },
    menuImages: {
      type: [String],
    },
    screens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen' // Reference to the screens associated with this restaurant
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
  RestaurantSchema.methods.generateAuthToken = async function () {
    const restaurant = this;
    const token = jwt.sign({ _id: restaurant._id }, process.env.RestTokenKey);
    restaurant.tokens = restaurant.tokens.concat({ token });
    await restaurant.save();
    console.log(token); // consoling the token
    return token;
  };
  
  // Finding the Restaurant by its credentials and checking the password with our hashed one
  RestaurantSchema.statics.findByCredentials = async (email, password) => {
      const restaurant = await Restaurant.findOne({ email });
    
      if (!restaurant) {
        throw new Error("Looks like you're not registered yet! Ready to join us? Sign up now and Expand Your Brand Demand!");
      }
    
      const isMatch = await bcrypt.compare(password, restaurant.password);
      if (!isMatch) {
        throw new Error("Password didn't Match");
      }
      return user;
    };
    RestaurantSchema.pre("save", async function (next) {
    const Restaurant = this;
    if (Restaurant.isModified("password")) {
        Restaurant.password = await bcrypt.hash(Restaurant.password, 8);
    }
    next();
  });
  
  const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
  
  module.exports = Restaurant;