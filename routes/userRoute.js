const express = require("express");
const { body, check } = require("express-validator");
const { route } = require("..");

const authController = require("../controller/authController");
const userController = require("../controller/userController");

const router = express.Router();

router.post(
  "/signup",
  body("email").isEmail().withMessage("Please input a valid email"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Minimum of 8 characters")
    .isIn("password")
    .withMessage("Carefully choose your password"),
  authController.signup
);

router.post("/login", authController.login);

router.post(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.patch(
  "/updateMe",
  authController.protect,
  userController.uploadProfilePhoto,
  (req, res, next) => {
    console.log("Image upload success");
    console.log(req.file);
    next();
  },
  userController.updateMe
);

router.post("/forgotpassword", authController.forgotPassword);
router.patch("/resetpassword/:token", authController.resetPassword);

module.exports = router;
