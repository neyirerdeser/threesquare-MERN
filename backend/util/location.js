const axios = require("axios");
const HttpError = require("../models/http-error");

async function getCoordsForAdress(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_API_KEY}`
  );

  const data = response.data;
  if (!data || data.status === "ZERO_RESULTS")
    throw new HttpError("could not get location", 422); // could be 404 also, 422 assumes user error

  const coordinates = data.results[0].geometry.location;
  return coordinates;
}

module.exports = getCoordsForAdress;
