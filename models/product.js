const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const productSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    files: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    shopName: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { minimize: false }
);

productSchema.post("save", handleSaveErrors);

const Product = model("product", productSchema);

const addProductSchema = Joi.object({
  category: Joi.string().required(),
  date: Joi.date().required(),
  description: Joi.string().required(),
  files: Joi.any().meta({ index: true }),
  //   files: Joi.array().items(Joi.string()).required(),
  price: Joi.number().required(),
  shopName: Joi.string().required(),
  userId: Joi.string().required(),
});

const deleteProductSchema = Joi.object({});

const schemas = {
  addProductSchema,
  deleteProductSchema,
};

module.exports = {
  Product,
  schemas,
};
