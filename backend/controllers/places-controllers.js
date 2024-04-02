const uuid = require("uuid").v4; // versions are different kinds of ids, v4 has a timestamp component in it
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAdress = require("../util/location");
const Place = require("../models/place");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "ESB",
    desc: "empire  states building",
    address: "West 34th Street, New York, NY, USA",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "ESB",
    desc: "empire  states building",
    address: "West 34th Street, New York, NY, USA",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u1",
  },
];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: p1 }
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError("something went wrong", 500));
  }

  if (!place) return next(new HttpError("could not find said place", 404));

  res.json({ place: place.toObject({ getters: true }) }); // { place } => { place: place } // getters make the id readable in this case
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
    console.log("TEST",places)
  } catch (error) {
    return next(new HttpError("could not find places for the user", 500));
  }

  if (!places || places.length === 0)
    return next(new HttpError("no places exist for the user", 404));
  // next must be used if running async funcs. // returning so that the rest doesnt run

  res.json({ places });
};

const createPlace = async (req, res, next) => {
  // needs async bc were working with promises now, also using await and next (instead of throw)
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError("invalid inputs", 422)); // unprocessible entry

  const { title, desc, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAdress(address);
  } catch (error) {
    return next(error);
  }
  const createdPlace = new Place({
    // id: uuid(),
    title,
    description: desc,
    address,
    location: coordinates,
    creator,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Sobá.jpg/1280px-Sobá.jpg",
  });
  // DUMMY_PLACES.push(createdPlace); // unshift(createdPlace) if you want it to be the first item
  try {
    await createdPlace.save();
  } catch (error) {
    return next(new HttpError("could not create place", 500));
  }
  res.status(201).json({ place: createdPlace });
};

const updatePlaceById = (req, res, next) => {
  if (!validationResult(req).isEmpty())
    throw new HttpError("invalid inputs", 422);

  const placeId = req.params.pid;
  const { title, desc } = req.body;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) }; // copies the original with all attributes
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);

  updatedPlace.title = title;
  updatedPlace.desc = desc;

  DUMMY_PLACES[placeIndex] = updatedPlace;
  res.status(200).json(updatedPlace);
};

const deletePlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const deletedPlace = DUMMY_PLACES.find((p) => p.id === placeId);
  if (!deletedPlace) throw new HttpError("could not find said place", 404);
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p !== deletedPlace);
  // DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId); // wouldve been a one-line solution but i wanted to return deleted place in my json
  res.status(200).json(deletedPlace);
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
