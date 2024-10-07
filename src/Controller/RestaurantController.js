const Restaurant = require("../Models/Restaurants")

exports.AddRestaurant = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingRestaurant = await Restaurant.findOne({ email });
        if (existingRestaurant) {
            return res.status(400).json({ message: "Restaurant with this email already exists" });
        }
        const restaurant = new Restaurant({ name, email, password, owner:req.restowner});
        
        await restaurant.save();
        res.status(201).json({
            message: "Restaurant added successfully",
            restaurant,
            token
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