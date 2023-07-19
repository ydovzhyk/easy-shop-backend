const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const newMessageSchema = new Schema(
  {
    messageArray: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    userReceiver: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    dialogue: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

newMessageSchema.post("save", handleSaveErrors);

const addNewMessageSchema = Joi.object({});

const schemas = {
  addNewMessageSchema,
};

const NewMessage = model("newMessage", newMessageSchema);

module.exports = {
  NewMessage,
  schemas,
};
