const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  image: {
    type: String,
    default:'uploads/images/default-place.jpeg',
  }, // String is the URL
  creator: { type: mongoose.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Place", placeSchema);
// collection will be named places
