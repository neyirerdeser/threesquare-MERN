const e = require("express");
const HttpError = require("../models/http-error");
const uuid = require("uuid").v4;
const{validationResult} = require('express-validator')

const DUMMY_USERS = [
  {
    id: "u1",
    name: "neyir e",
    email: "a@b.c",
    password: "1234",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {
  if (!validationResult(req).isEmpty())
    throw new HttpError("invalid inputs", 422);

  const { username, email, password } = req.body;
  const existingUser = DUMMY_USERS.find((u) => u.email === email);
  if(existingUser) throw new HttpError('user already exists!', 422); // invalid user input

  const createdUser = {
    id: uuid(),
    name: username,
    email,
    password,
  };

  DUMMY_USERS.push(createdUser);
  res.status(201).json(createdUser);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  const user = DUMMY_USERS.find((u) => u.email === email);
  if (!user || user.password !== password)
    throw new HttpError("credentials not matching", 401); // failed auth
  res.json({ message: "logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
