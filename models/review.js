const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const validType = ["asSeller", "asCustomer"];

const reviewSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    products: [{ type: Schema.Types.Mixed, ref: "Product" }],
    reviewer: {
      reviewerId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      reviewerName: {
        type: String,
        default: "",
      },
      reviewerFoto: {
        type: String,
        default: "",
      },
    },
    reviewDate: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: "1",
    },
    feedback: {
      type: String,
      default: "",
    },
    feedbackType: {
      type: String,
      default: "",
    },
  },
  { minimize: false }
);

reviewSchema.post("save", handleSaveErrors);

const Review = model("review", reviewSchema);

const addReviewSchema = Joi.object({
  sellerId: Joi.string().required(),
  products: Joi.array().required(),
  rating: Joi.number().required(),
  feedback: Joi.string().required(),
  orderId: Joi.string().required(),
  feedbackType: Joi.string().required(),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().required(),
  feedback: Joi.string().required(),
  reviewId: Joi.string().required(),
});

const getUserFeedbackSchema = Joi.object({
  userId: Joi.string().pattern(new RegExp("^[0-9a-fA-F]{24}$")),
  feedbackType: Joi.string()
    .valid(...validType)
    .optional(),
});

const schemas = {
  addReviewSchema,
  updateReviewSchema,
  getUserFeedbackSchema,
};

module.exports = {
  Review,
  schemas,
};
