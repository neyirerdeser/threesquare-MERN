// SETUP
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const fs = require("fs"); // filesystem
const path = require("path");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

require("dotenv").config(); // for environment variables
const app = express();

// MIDDLEWARE
app.use(bodyParser.json()); // adding this up top so that the body is parsed before we reach other endpoints
app.use("/uploads/images", express.static(path.join('uploads','images'))); // static serving means you return a file
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

// unsupported routes. not the regular error handling but if we havent sent a response so far, we'll get here
app.use((req, res, next) => {
  throw new HttpError("couldnt find the route", 404);
});

// error handling middleware
app.use((error, req, res, next) => {
  if (req.file) fs.unlink(req.file.path, (e) => {if(e) console.log(e)}); // error only if the file isnt deleted, dont care enough
  if (res.headerSet) return next(error); // you can only send one response. if we've somehow already sent one, we cant send another
  res.status(error.code || 500);
  res.json({ message: error.message || "unknown error. sorry :(" });
  console.log({ message: error.message || "unknown error. sorry :(" });
});

// LISTEN
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000);
  })
  .catch((error) => {
    console.log(error);
  });
