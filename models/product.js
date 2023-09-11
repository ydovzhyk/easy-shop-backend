const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const validSelectors = ["new", "advice", "sale"];

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
    status: {
      type: String,
      required: true,
      default: true,
    },
    saleDate: {
      type: String,
    },
    sale: {
      type: Number,
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
  vip: Joi.string().required(),
  quantity: Joi.number().required(),
  keyWords: Joi.string().required(),
  size: Joi.array().required(),
  category: Joi.string().required(),
  mainFileName: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  date: Joi.string().required(),
});

const updateProductSchema = Joi.object({
  nameProduct: Joi.string().optional(),
  brendName: Joi.string().optional(),
  condition: Joi.string().optional(),
  section: Joi.string().optional(),
  vip: Joi.string().optional(),
  quantity: Joi.string().optional(),
  keyWords: Joi.string().optional(),
  size: Joi.array().optional(),
  category: Joi.string().optional(),
  mainFileName: Joi.string().optional(),
  description: Joi.string().optional(),
  price: Joi.string().optional(),
  date: Joi.string().optional(),
});

const getUserProductsSchema = Joi.object({
  page: Joi.number().integer().min(1),
});

const getProductsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  searchQuery: Joi.string().optional(),
  section: Joi.string().optional(),
  category: Joi.string().optional(),
  filterData: Joi.array().optional(),
});

const getSelectorProductsSchema = Joi.object({
  page: Joi.number().integer().min(1),
  selectorName: Joi.string().valid(...validSelectors),
});

const schemas = {
  addProductSchema,
  updateProductSchema,
  addProductSchema,
  getUserProductsSchema,
  getProductsQuerySchema,
  getSelectorProductsSchema,
};

module.exports = {
  Product,
  schemas,
};
