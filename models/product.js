const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const productSchema = new Schema(
  {
    nameProduct: {
      type: String,
      required: true,
    },
    mainPhotoUrl: {
      type: String,
      required: true,
    },
    additionalPhotoUrl: {
      type: [String],
      required: true,
    },
    brendName: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
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
    keyWords: {
      type: String,
      required: true,
    },
    vip: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    size: {
      type: [],
      default: [],
    },
    userLikes: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
  },
  { minimize: false }
);

productSchema.post("save", handleSaveErrors);

const Product = model("product", productSchema);

const addProductSchema = Joi.object({
  nameProduct: Joi.string().required(),
  brendName: Joi.string().required(),
  condition: Joi.string().required(),
  section: Joi.string().required(),
  category: Joi.string().required(),
  quantity: Joi.number().required(),
  date: Joi.date().required(),
  description: Joi.string().required(),
  keyWords: Joi.string().required(),
  vip: Joi.string().required(),
  size: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.string().required(),
      })
    )
    .required(),
  file: Joi.string().uri().required(),
  files: Joi.array().items(Joi.string()).required(),
  price: Joi.number().required(),
  owner: Joi.string().required(),
  mainFileName: Joi.string().required(),
});

const deleteProductSchema = Joi.object({});

const userProducts = Joi.object({ _id: Joi.string() });

const schemas = {
  addProductSchema,
  deleteProductSchema,
  userProducts,
};

module.exports = {
  Product,
  schemas,
};
