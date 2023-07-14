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
      },
      customerFirstName: {
        type: String,
      },
      customerSurName: {
        type: String,
      },
      customerTel: {
        type: String,
      },
    },
    // customerId: {
    //   type: Schema.Types.ObjectId,
    //   required: true,
    // },
    // customerSecondName: {
    //   type: String,
    // },
    // customerFirstName: {
    //   type: String,
    // },
    // customerSurName: {
    //   type: String,
    // },
    // customerTel: {
    //   type: String,
    // },
    delivery: {
      type: String,
    },
  },
  { minimize: false }
);

orderSchema.post("save", handleSaveErrors);

const Order = model("order", orderSchema);

const addPreOrderSchema = Joi.object({
  sellerName: Joi.string().required(),
  sellerId: Joi.string().required(),
  products: Joi.array()
    .items(
      Joi.object({
        price: Joi.number().required(),
        quantity: Joi.number().required(),
        size: Joi.array().required(),
        sum: Joi.number().required(),
        _id: Joi.string().required(),
      })
    )
    .required(),
  orderSum: Joi.number().required(),
});

const updateOrderSchema = Joi.object({
  sellerName: Joi.string().required(),
  products: Joi.array()
    .items(
      Joi.object({
        price: Joi.number().required(),
        quantity: Joi.number().required(),
        size: Joi.array().required(),
        sum: Joi.number().required(),
        _id: Joi.string().required(),
      })
    )
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
  addPreOrderSchema,
  updateOrderSchema,
};

module.exports = {
  Order,
  schemas,
};
