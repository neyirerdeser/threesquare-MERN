const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password"); // does not display their passwords
  } catch (error) {
    return next(new HttpError("could not find users", 500));
  }
  if (users.length === 0) return next(new HttpError("no users exist", 404));

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  if (!validationResult(req).isEmpty())
    return next(new HttpError("invalid inputs", 422));

  const { username, email, password } = req.body;

  const createdUser = new User({
    name: username,
    email,
    password,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  res.status(201).json({ user: createdUser });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError(error, 500));
  }
  if (!user || user.password !== password)
    return next(new HttpError("credentials not matching", 401)); // failed auth

  res.json({ message: "logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
