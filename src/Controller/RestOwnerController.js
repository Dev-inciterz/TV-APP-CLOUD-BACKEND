const RestaurantOwner = require("../Models/RestaurantOwner");

exports.Signup = async (req, res) => {
  console.log("ejvbevb jwe fjlk.we, ewjv kel");

  try {
    const restowner = new RestaurantOwner({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
    });

    const token = await restowner.generateAuthToken();

    const result = await restowner.save();

    console.log("the restowner saved", result);

    res.status(201).json({
      message: "RestaurantOwner Added successfully",
      result: result,
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
      error: error.message,
    });
  }
};

exports.Login = async (req, res) => {
  try {
    const restowner = await RestaurantOwner.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await restowner.generateAuthToken();

    res.status(201).json({ restowner: restowner, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
      error: error.message,
    });
  }
};

exports.Logout = async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const token = req.header("Authorization").replace("Bearer ", "");

    // Remove the specified token from the restowner's tokens array
    req.restowner.tokens = req.restowner.tokens.filter((restownerToken) => {
      return restownerToken.token !== token;
    });

    // Save the updated restowner
    await req.restowner.save();
    res.status(201).json({
      message: "Logged Out Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
      error: error.message,
    });
  }
};
