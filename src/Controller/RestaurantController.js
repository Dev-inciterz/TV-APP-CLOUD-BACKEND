const Restaurant = require("../Models/Restaurants")
const RestaurantOwner = require("../Models/RestaurantOwner")

exports.AddRestaurant = async (req, res) => {

  console.log("i am being hit forst")
  try {
      const { name, email, password } = req.body;

      // Check if the restaurant already exists
      const existingRestaurant = await Restaurant.findOne({ email });
      if (existingRestaurant) {
          return res.status(400).json({ message: "Restaurant with this email already exists" });
      }

      console.log("eirhcbjkev uier", req.restowner._id)

      // Create a new restaurant with the owner reference
      const restaurant = new Restaurant({ name, email, password, owner: req.restowner });

      // Save the restaurant
      await restaurant.save();

      // Find the owner and update the restaurants array by pushing the new restaurant's ID
      const owner = await RestaurantOwner.findById(req.restowner);
      if (!owner) {
          return res.status(404).json({ message: "Owner not found" });
      }
      
      owner.restaurants.push(restaurant._id); // Add restaurant ID to the owner's restaurants array
      await owner.save(); // Save the updated owner document



      // Respond with success message
      res.status(201).json({
          message: "Restaurant added successfully",
          // restaurant,
     
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          message: "Something went wrong",
          error: error.message,
      });
  }
};


exports.UpdateRestaurant = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        let addImg = [];
        // If new images are uploaded, upload them to Cloudinary
        if (req.files && req.files.length) {
          const uploadPromises = req.files.map((image) => {
            return new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                {
                  folder: "Menus", // Specify the Cloudinary folder
                },
                (error, result) => {
                  if (result) {
                    resolve(result.secure_url); // Resolve with the new image URL
                  } else {
                    reject(error); // Reject in case of an error
                  }
                }
              );
              stream.end(image.buffer); // Upload the image buffer
            });
          });

          // Wait for all images to be uploaded
          addImg = await Promise.all(uploadPromises);
        }
    

        const oldRest = Restaurant.findById(restaurantId)

        if (!oldRest) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        

        // Prepare an object to store updated fields
        const updatedRestaurant = {};

       // Only add fields that are provided in the request body
       if (req.body.name) updatedRestaurant.name = req.body.name;
       if (req.body.location) updatedRestaurant.location = req.body.location;
       if (req.body.website) updatedRestaurant.website = req.body.website;


           // If new images are uploaded, update the pictures field
    if (addImg.length) {
        // Delete old images from Cloudinary if new images are provided
        if (oldRest.menuImages && oldRest.menuImages.length) {
          const deletePromises = oldRest.pictures.map((oldImageUrl) => {
            const publicId = oldImageUrl.split('/').pop().split('.')[0]; // Extract public_id from URL
            return cloudinary.uploader.destroy(`Menus/${publicId}`);
          });
  
          // Wait for all old images to be deleted
          await Promise.all(deletePromises);
        }
  
        updatedRestaurant.menuImages = addImg; // Update with new images
      }

      const result = await Restaurant.findByIdAndUpdate(restaurantId,updatedRestaurant)
        res.status(200).json({
            message: "Restaurant updated successfully",
            restaurant: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
};



exports.RemoveRestaurantImagesAll = async (req, res) => {
    try {
      const restaurantId = req.params.id;
  
      // Find the restaurant by ID
      const restaurant = await Restaurant.findById(restaurantId);
  
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      // Check if the restaurant has any images to delete
      if (!restaurant.menuImages || !restaurant.menuImages.length) {
        return res.status(400).json({ message: "No images to delete" });
      }
  
      // Delete the images from Cloudinary
      const deletePromises = restaurant.menuImages.map((imageUrl) => {
        const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract public_id from the image URL
        return cloudinary.uploader.destroy(`Menus/${publicId}`);
      });
  
      // Wait for all images to be deleted from Cloudinary
      await Promise.all(deletePromises);
  
      // Remove the images from the database by setting `menuImages` to an empty array
      restaurant.menuImages = [];
      await restaurant.save();
  
      res.status(200).json({
        message: "Images removed successfully from Cloudinary and MongoDB",
        restaurant,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Something went wrong",
        error: error.message,
      });
    }
  };
  

  exports.RemoveSingleImage = async (req, res) => {
    try {
      const restaurantId = req.params.id;
      const imageUrl = req.body.imageUrl; // Get the image URL to be deleted from the request body
  
      // Find the restaurant by ID
      const restaurant = await Restaurant.findById(restaurantId);
  
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      // Check if the image exists in the restaurant's menuImages array
      const imageIndex = restaurant.menuImages.indexOf(imageUrl);
      if (imageIndex === -1) {
        return res.status(400).json({ message: "Image not found in the restaurant's menuImages" });
      }
  
      // Extract the public_id from the image URL
      const publicId = imageUrl.split('/').pop().split('.')[0];
  
      // Delete the image from Cloudinary
      await cloudinary.uploader.destroy(`Menus/${publicId}`);
  
      // Remove the image from the menuImages array
      restaurant.menuImages.splice(imageIndex, 1); // Remove the image at the found index
      await restaurant.save(); // Save the updated restaurant document
  
      res.status(200).json({
        message: "Image removed successfully from Cloudinary and MongoDB",
        restaurant,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Something went wrong",
        error: error.message,
      });
    }
  };
  


exports.DeleteRestaurant = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        
        const deletedRestaurant = await Restaurant.findByIdAndDelete(restaurantId);
        
        if (!deletedRestaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        res.status(200).json({
            message: "Restaurant deleted successfully",
            restaurant: deletedRestaurant
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
};

exports.ViewAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find().populate('owner screens'); // Populating owner and screens fields
        
        res.status(200).json({
            message: "Restaurants fetched successfully",
            restaurants
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
};


exports.ViewRestaurantById = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        
        const restaurant = await Restaurant.findById(restaurantId).populate('owner screens');
        
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        res.status(200).json({
            message: "Restaurant fetched successfully",
            restaurant
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
};


exports.LoginRestaurant = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const restaurant = await Restaurant.findByCredentials(email, password);
        const token = await restaurant.generateAuthToken();
        
        res.status(200).json({
            message: "Login successful",
            restaurant,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Invalid credentials",
            error: error.message,
        });
    }
};