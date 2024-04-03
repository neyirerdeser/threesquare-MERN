const mongoose = require("mongoose");
const Place = require("./place");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  places: { type: Array },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
