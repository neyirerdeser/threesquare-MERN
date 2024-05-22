const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const fs = require("fs");

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
    return next(new HttpError(error.message, 500));
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
    return next(new HttpError(error.message, 500));
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

  const { title, description, address } = req.body;
  const creator = req.userData.userId;

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
    return next(new HttpError(error.message, 500));
  }
  if (!loggedUser) return next(new HttpError("no such user", 404));

  const createdPlace = new Place({
    title,
    description: description,
    address,
    location: coordinates,
    creator,
    image: req.file ? req.file.path : undefined,
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
    return next(new HttpError(error.message, 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlaceById = async (req, res, next) => {
  if (!validationResult(req).isEmpty())
    throw new HttpError("invalid inputs", 422);

  const placeId = req.params.pid;
  const { title, description } = req.body;

  let placeToUpdate;
  try {
    placeToUpdate = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
  if (!placeToUpdate)
    return next(new HttpError("could not find said place", 404));

  // the place is established. check if the user who sent the request is the creator
  if (placeToUpdate.creator.toString() !== req.userData.userId) // creator is a mongoose id object
    return next(new HttpError("non-authorized user", 401));

  if (placeToUpdate.image !== "uploads/images.default-place.jpeg")
    fs.unlink(placeToUpdate.image, (e) => {
      if (e) console.log(e);
    });

  placeToUpdate.title = title || placeToUpdate.title;
  placeToUpdate.description = description || placeToUpdate.description;
  placeToUpdate.image = req.file ? req.file.path : placeToUpdate.image;

  try {
    await placeToUpdate.save();
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }

  res.status(200).json({ place: placeToUpdate.toObject({ getters: true }) });
};

const deletePlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let placeToDelete;
  try {
    placeToDelete = await Place.findById(placeId).populate("creator"); // bc of this the .creator hold the user object not id
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
  if (!placeToDelete) return next(new HttpError("place does not exist", 404));

  if (placeToDelete.creator.id !== req.userData.userId) // id here doesnt refer to oanother mongoose model, hence just a string
    return next(new HttpError("non-authorized user", 401));

  const imageToDelete = placeToDelete.image;

  try {
    const session = await mongoose.startSession();
    await session.startTransaction();
    placeToDelete.creator.places.pull(placeToDelete);
    await placeToDelete.creator.save({ session });
    await placeToDelete.deleteOne({ session });
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }

  if (imageToDelete !== "uploads/images.default-place.jpeg")
    fs.unlink(imageToDelete, (e) => {
      if (e) console.log(e);
    });

  res.status(200).json({ message: "place deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
