const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const emailRegexp =
  /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "User Name is required"],
      minlength: 2,
      maxLength: 25,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: emailRegexp,
    },
    userAvatar: {
      type: String,
    },
    passwordHash: {
      type: String,
      required: [true, "Set password for user"],
      minlength: 6,
    },
    cityName: {
      type: String,
    },
    firstName: {
      type: String,
    },
    surName: {
      type: String,
    },
    houseNamber: {
      type: String,
    },
    streetName: {
      type: String,
    },
    secondName: {
      type: String,
    },
    sex: {
      type: String,
    },
    tel: {
      type: String,
    },
    about: {
      type: String,
    },
    dateCreate: {
      type: Date,
    },
    referer: {
      type: String,
      default: "/",
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: "",
    },
    lastVisit: {
      type: Date,
    },
    userProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    userBasket: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    userLikes: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    userDialogue: [{ type: Schema.Types.ObjectId, ref: "Dialogue" }],
    userOrders: [{ type: Schema.Types.ObjectId, ref: "Orders" }],
    userSubscriptions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    userSearchSubscription: {
      type: [String],
      default: [],
    },
    userFollowers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    newMessage: {
      type: Number,
      default: 0,
    },
    userSales: [{ type: Schema.Types.ObjectId, ref: "Orders" }],
    rating: {
      type: Number,
      default: 0,
    },
    successfulSales: {
      type: Number,
      default: 0,
    },
    userReviews: [{ type: Schema.Types.ObjectId, ref: "Reviews" }],
    userFeedback: [{ type: Schema.Types.Mixed, ref: "Reviews" }],
  },

  { minimize: false }
);

userSchema.post("save", handleSaveErrors);

const User = model("user", userSchema);

const registerSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().required(),
  userAvatar: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const refreshTokenSchema = Joi.object({
  sid: Joi.string().required(),
});

const verificationSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
});

const updateUserSettingsSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp),
  userAvatar: Joi.alternatives().try(Joi.string(), Joi.object()),
  cityName: Joi.alternatives().try(Joi.string().allow(""), Joi.object()),
  firstName: Joi.alternatives().try(Joi.string().allow(""), Joi.object()),
  surName: Joi.alternatives().try(Joi.string().allow(""), Joi.object()),
  houseNamber: Joi.alternatives().try(Joi.string().allow(""), Joi.object()),
  streetName: Joi.alternatives().try(Joi.string().allow(""), Joi.object()),
  secondName: Joi.alternatives().try(Joi.string().allow(""), Joi.object()),
  sex: Joi.alternatives().try(Joi.string().allow(""), Joi.object()),
  tel: Joi.alternatives().try(Joi.string().allow(""), Joi.object()),
  about: Joi.alternatives().try(Joi.string().allow(""), Joi.object()),
});

const updateUserSearchSubscribesSchema = Joi.object({
  urlSubscription: Joi.alternatives()
    .try(Joi.string().allow(""), Joi.object())
    .required(),
  statusDelete: Joi.boolean().allow(null).optional(),
});

const userLikesBasketSchema = Joi.object({
  currentPage: Joi.number().required(),
});

const updateUserBasketSchema = Joi.object({
  productId: Joi.string().pattern(new RegExp("^[0-9a-fA-F]{24}$")),
  selectedSizes: Joi.array().optional(),
});

const userSubscriptionsSchema = Joi.object({
  currentPage: Joi.number().required(),
});

const schemas = {
  registerSchema,
  loginSchema,
  verificationSchema,
  refreshTokenSchema,
  updateUserSettingsSchema,
  updateUserSearchSubscribesSchema,
  userLikesBasketSchema,
  updateUserBasketSchema,
  userSubscriptionsSchema,
};

module.exports = {
  User,
  schemas,
};
