const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const getCoordsForAdress = require("../util/location");

const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError(error, 500));
  }
  if (!place) return next(new HttpError("could not find said place", 404));

  res.json({ place: place.toObject({ getters: true }) }); // getters make the id readable in this case
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId).populate("places");
  } catch (error) {
    return next(new HttpError(error, 500));
  }
  if (!user || user.places.length === 0)
    return next(new HttpError("no places exist for such user", 404));

  res.json({
    places: user.places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError("invalid inputs", 422)); // unprocessible entry

  const { title, desc, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAdress(address);
  } catch (error) {
    return next(error);
  }

  let loggedUser;
  try {
    loggedUser = await User.findById(creator);
  } catch (error) {
    return next(new HttpError(error, 500));
  }
  if (!loggedUser) return next(new HttpError("no such user", 404));

  const createdPlace = new Place({
    title,
    description: desc,
    address,
    location: coordinates,
    creator,
  });

  try {
    // IMPORTANT: transaction requires that the collection is pre-existing (i.e places for Place item to be saved)
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    loggedUser.places.push(createdPlace); // this is a mongoose push // only adds the id
    await loggedUser.save({ session });
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlaceById = async (req, res, next) => {
  if (!validationResult(req).isEmpty())
    throw new HttpError("invalid inputs", 422);

  const placeId = req.params.pid;
  const { title, desc } = req.body;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError(error, 500));
  }
  if (!place) return next(new HttpError("could not find said place", 404));

  place.title = title || place.title;
  place.description = desc || place.description;

  try {
    await place.save();
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let placeToDelete;
  try {
    placeToDelete = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(new HttpError(error, 500));
  }
  if (!placeToDelete) return next(new HttpError("place does not exist", 404));

  try {
    const session = await mongoose.startSession();
    await session.startTransaction();
    placeToDelete.creator.places.pull(placeToDelete);
    await placeToDelete.creator.save({ session });
    await placeToDelete.deleteOne({ session });
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  res.status(200).json({ message: "place deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
