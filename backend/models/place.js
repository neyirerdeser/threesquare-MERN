const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  image: { type: String, required: true }, // String is the URL
  creator: { type: String, required: true },
});

module.exports = mongoose.model("Place", placeSchema);
// collection will be named places
