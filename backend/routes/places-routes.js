const express = require("express");
const { check, oneOf } = require("express-validator");
const placesControllers = require("../controllers/places-controllers");
const fileupload = require("../middleware/file-upload");

const router = express.Router();

// list the string one first so that /user does not get recognized as :pid (more to less specific)
router.get("/user/:uid", placesControllers.getPlacesByUserId);
router.get("/:pid", placesControllers.getPlaceById);
router.patch(
  "/:pid",
  fileupload.single("image"),
  [oneOf([check("title").not().isEmpty(), check("description").isLength({ min: 5 })])],
  placesControllers.updatePlaceById
);
router.delete("/:pid", placesControllers.deletePlaceById);
router.post(
  "/",
  fileupload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);

module.exports = router;
