const { Schema, model, default: mongoose } = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Input your first name"],
  },

  lastName: {
    type: String,
    required: [true, "Input your last name"],
  },
  email: {
    type: String,
    required: [true, "Input your email"],
    // validator: {
    //     validate: function(e){
    //         return isEmail(e)
    //     },
    // }
    validate: [validator.isEmail, "Invalid Email"],
    unique: [true, "Email already exist"],
  },
  profilePhoto: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Please input a password"],
    select: false,
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },

  resetPasswordToken: String,
  resetPasswordExpires: String,
});

userSchema.virtual("fullname").get(function () {
  return this.firstName + " " + this.lastName;
});

userSchema.virtual("Tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "user",
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;

  next();
});

userSchema.methods.comparePassword = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 600000;

  return resetToken;
};

const User = model("User", userSchema);

module.exports = User;
