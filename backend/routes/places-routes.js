const express = require("express");
const { check, oneOf } = require("express-validator");
const placesControllers = require("../controllers/places-controllers");

const router = express.Router();

// list the string one first so that /user does not get recognized as :pid (more to less specific)
router.get("/user/:uid", placesControllers.getPlacesByUserId);
router.get("/:pid", placesControllers.getPlaceById);
router.patch(
  "/:pid",
  [oneOf([check("title").not().isEmpty(), check("desc").isLength({ min: 5 })])],
  placesControllers.updatePlaceById
);
router.delete("/:pid", placesControllers.deletePlaceById);
router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("desc").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);
router.use((err,req,res,next)=>{
  res.status(500).send(err.message);
})

module.exports = router;
