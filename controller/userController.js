const multer = require("multer");
const User = require("../model/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");
const crypto = require("crypto");

exports.updateMe = catchAsync(async (req, res, next) => {
  //Allowed update fields
  const updateValues = {};
  const allowedUpdate = ["firstName", "lastName", "email", "profilePhoto"];

  Object.keys(req.body).forEach((el) => {
    if (allowedUpdate.includes(el)) updateValues[el] = req.body[el];
  });

  if (req.body.password || req.body.confirmPassword)
    return next(new AppError("Invalid route for password update", 400));

  // updating the fields
  const id = JSON.stringify(req.user._id).replace(/"/g, "");
  const user = await User.findByIdAndUpdate(id, updateValues);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./img/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});
const upload = multer({ storage: multerStorage });
exports.uploadProfilePhoto = upload.single("photo");
