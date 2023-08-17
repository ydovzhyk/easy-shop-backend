const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const reviewSchema = new Schema(
  {
    sellerId: {
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
      type: String,
      default: "1",
    },
    feedback: {
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
  rating: Joi.string().required(),
  feedback: Joi.string().required(),
  orderId: Joi.string().required(),
});

const schemas = {
  addReviewSchema,
};

module.exports = {
  Review,
  schemas,
};
