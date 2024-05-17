const express = require("express");
const usersControllers = require("../controllers/users-controllers");
const fileupload = require("../middleware/file-upload");
const { check } = require("express-validator");

const router = express.Router();

router.post(
  "/signup",
  fileupload.single('image'), // similar to running the  bodyparser middleware before any other in app.js
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(), // eMail@gooGLE.com -> email@google.com
    check("password").isLength(6),
  ],
  usersControllers.signup
);
router.post("/login", usersControllers.login);
router.get("/", usersControllers.getUsers);

module.exports = router;
