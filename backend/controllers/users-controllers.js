const HttpError = require("../models/http-error");
const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");
const User = require("../models/user");

// const DUMMY_USERS = [
//   {
//     id: "u1",
//     name: "neyir e",
//     email: "a@b.c",
//     password: "1234",
//   },
// ];

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find();
  } catch (error) {
    return next(new HttpError("could not find users", 500));
  }

  if (!users || users.length === 0)
    return next(new HttpError("no users exist", 404));
  // next must be used if running async funcs. // returning so that the rest doesnt run

  res.json({ users });
};

const signup = async (req, res, next) => {
  if (!validationResult(req).isEmpty())
    return next(new HttpError("invalid inputs", 422));

  const { username, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("couldnt check existing user", 500));
  }
  if (existingUser) return next(new HttpError("user already exists!", 422)); // invalid user input

  const createdUser = new User({
    name: username,
    email,
    password,
  });

  try {
    await createdUser.save();
  } catch (error) {
    return next(new HttpError("failed to create user", 500));
  }
  res.status(201).json({ user: createdUser });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user || user.password !== password)
    return next(new HttpError("credentials not matching", 401)); // failed auth
  res.json({ message: "logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
