const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { validateBeforeSave } = require("mongoose");
const { stringify } = require("querystring");
const { promisify } = require("util");
const { findById } = require("../model/userModel");
const User = require("../model/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");
const { reset } = require("nodemon");

const generateJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const sendToken = (user, statusCode, res) => {
  const token = generateJWT(user._id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmpassword,
    profilePhoto: req.body.photo,
  });

  await Email(
    "Welcome to Task Manager",
    "Thank you for choosing our app, we hope to satisfy all your need"
  );

  sendToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new AppError("Please input Email or Password"));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(req.body.password, user.password)))
    return next(new AppError("Invalid Email or Password", 400));

  sendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // Check if user is authorized
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(new AppError("You are not logged in", 401));

  // Check if token is valid
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // FInd the User
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new AppError("User no longer exists", 404));

  //set the User on the request to the current user
  req.user = currentUser;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // The user details from the logged in data
  const id = JSON.stringify(req.user._id).replace(/"/g, "");
  const user = await User.findById(id).select("+password");

  const { password, newPassword, newPasswordConfirm } = req.body;

  //check if given pasword is correct
  if (!(await user.comparePassword(password, user.password)))
    return next(new AppError("Incorrect Password", 400));

  if (password === newPassword)
    return next(
      new AppError("Current passowrd and new Password can't be the same")
    );

  user.password = newPassword;
  user.confirmPassword = newPasswordConfirm;

  await user.save();

  //log the user in
  sendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // find user based on the inputed email
  const user = await User.findOne({ email: req.body.email });
  if (!user || !req.body.email) {
    return next(new AppError("User not found, please try again", 404));
  }
  const resetToken = crypto.randomBytes(32).toString("hex");

  const resetTokenHashed = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const resetPasswordExpires = Date.now() + 600000;

  // user.resetPasswordToken = crypto
  //   .createHash("sha256")
  //   .update(resetToken)
  //   .digest("hex");

  await User.findOneAndUpdate(
    { email: req.body.email },
    { resetPasswordToken: resetTokenHashed, resetPasswordExpires }
  );

  // //create the reset token and save on the doc
  // await user.save({ validateBeforeSave: false });

  await Email("Rest Token", resetToken);
  try {
    res.status(200).json({
      status: "success",
      message: "Email Sent",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error in sending Email",
    });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;

  const resetToken = await crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    return next(new AppError("Token is Invalid or Expired", 400));
  }

  if (await user.comparePassword(req.body.password, user.password)) {
    return next(
      new AppError(
        `New password can't be the same with the current password`,
        400
      )
    );
  }

  console.log("Passowrd passed");

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires;
  try {
    res.status(200).json({
      status: "success",
      message: "Updated password successful",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err,
    });
  }
});
