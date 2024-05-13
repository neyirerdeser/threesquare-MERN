const express = require("express");
const usersControllers = require("../controllers/users-controllers");
const { check } = require("express-validator");

const router = express.Router();

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(), // eMail@gooGLE.com -> email@google.com
    check('password').isLength(6)
  ],
  usersControllers.signup
);
router.post("/login", usersControllers.login);
router.get("/", usersControllers.getUsers);

module.exports = router;
