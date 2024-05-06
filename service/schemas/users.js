const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required and must be a string"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: {
    type: String,
  },
});

const userModel = mongoose.model("user", userSchema);

userModel.validateUpdate = function (user) {
  const schema = Joi.object({
    name: Joi.string(),
    password: Joi.string().required(),
    email: Joi.string().email().required(),
    subscription: Joi.string().valid("starter", "pro", "business"),
  });
  return schema.validate(user);
};

userModel.validateAdd = function (user) {
  const schema = Joi.object({
    name: Joi.string(),
    password: Joi.string().required(),
    email: Joi.string().email().required(),
    subscription: Joi.string().valid("starter", "pro", "business"),
  });

  return schema.validate(user);
};

module.exports = userModel;
