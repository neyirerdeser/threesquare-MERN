const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password"); // does not display their passwords
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
  // if (users.length === 0) return next(new HttpError("no users exist", 404));
  // rather have the frontend say that on the webpage than an error

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  if (!validationResult(req).isEmpty())
    return next(new HttpError("invalid inputs", 422));

  const { name, email, password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12); // 12 salting sessions seems to be the sweet spot for complexity vs time needed
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file ? req.file.path : undefined,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (error) {
    if (error.message.includes("duplicate key error"))
      return next(new HttpError("user already exists, login instead?", 422));
    return next(new HttpError(error.message, 500));
  }

  let token;
  try {
    // doesnt return a promise but can fail
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.PRIVATE_KEY,
      { expiresIn: "1h" } // there are many options you can add, expiry is more or less required
    );
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
  if (!user)
    return next(new HttpError("no user associated with the given email", 404));

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
  if (!isValidPassword)
    return next(new HttpError("credentials not matching", 403)); // 401: non-authorized   403: no permission (non-authenticated)

  let token;
  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.PRIVATE_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }

  res.json({ userId: user.id, email: user.email, token });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
