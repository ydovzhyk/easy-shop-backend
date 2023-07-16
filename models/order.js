const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const orderSchema = new Schema(
  {
    sellerName: {
      type: String,
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    products: [{ type: Schema.Types.Mixed, ref: "Product" }],
    orderSum: {
      type: Number,
      required: true,
    },
    client: {
      customerId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      customerSecondName: {
        type: String,
        default: "",
      },
      customerFirstName: {
        type: String,
        default: "",
      },
      customerSurName: {
        type: String,
        default: "",
      },
      customerTel: {
        type: String,
        default: "",
      },
    },
    delivery: {
      type: String,
      default: "",
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
  },
  { minimize: false }
);

orderSchema.post("save", handleSaveErrors);

const Order = model("order", orderSchema);

const addOrderSchema = Joi.object({
  ownerName: Joi.string().required(),
  ownerId: Joi.string().required(),
  products: Joi.array()
    // .items(
    //   Joi.object({
    //     price: Joi.number().required(),
    //     quantity: Joi.number().required(),
    //     size: Joi.array().required(),
    //     sum: Joi.number().required(),
    //     _id: Joi.string().required(),
    //   })
    // )
    .required(),
  totalSum: Joi.number().required(),
});

const updateOrderSchema = Joi.object({
  orderId: Joi.string().required(),
  sellerName: Joi.string().required(),
  sellerId: Joi.string().required(),
  products: Joi.array()
    // .items(
    //   Joi.object({
    //     price: Joi.number().required(),
    //     quantity: Joi.number().required(),
    //     size: Joi.array().required(),
    //     sum: Joi.number().required(),
    //     _id: Joi.string().required(),
    //   })
    // )
    .required(),
  totalSum: Joi.number().required(),
  customerId: Joi.string().required(),
  customerFirstName: Joi.string().required(),
  customerSurName: Joi.string().required(),
  customerSecondName: Joi.string().required(),
  delivery: Joi.string().required(),
  customerTel: Joi.string().required(),
});


const schemas = {
  addOrderSchema,
  updateOrderSchema,
};

module.exports = {
  Order,
  schemas,
};
