const multer = require("multer");
const uuid = require("uuid").v1;

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileupload = multer({
  limits: 500000, //byte =500kb
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]; // !! converts undefined/null to false and data to true
    let error = isValid ? null : new Error('invalid mime type');
    cb(error, isValid); // cb expects null is there are no issues and error otherwise
  },
});

module.exports = fileupload;
