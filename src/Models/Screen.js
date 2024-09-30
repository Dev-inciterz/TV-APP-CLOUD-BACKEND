const mongoose = require("mongoose");

const screenSchema = new Schema({
    screenId: {
      type: String,
      required: true,
      unique: true // Unique identifier for each screen (e.g., UUID or some generated ID)
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant', // Reference to the restaurant this screen belongs to
      required: true
    },
    isSlideshow: {
      type: Boolean,
      default: false // Whether this screen should display a slideshow or a single image
    }
  }, { timestamps: true });
  
  const Screen = mongoose.model('Screen', screenSchema);
  module.exports = Screen;
  