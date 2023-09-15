const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const dialogueType = ["checkout", "sales", "cancel"];

const dialogueSchema = new Schema(
  {
    messageArray: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    productOwner: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userAvatar: {
      type: String,
    },
    productOwnerAvatar: {
      type: String,
    },
    statusDialogue: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    newMessages: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  },
  { versionKey: false, timestamps: true }
);

dialogueSchema.post("save", handleSaveErrors);

const createDialogueSchema = Joi.object({
  text: Joi.string().required(),
  productId: Joi.string()
    .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
    .allow(null)
    .optional(),
  productOwner: Joi.string()
    .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
    .allow(null)
    .optional(),
  dialogueId: Joi.string()
    .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
    .allow(null)
    .optional(),
  customerId: Joi.string()
    .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
    .allow(null)
    .optional(),
  sellerId: Joi.string()
    .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
    .allow(null)
    .optional(),
});

const getDialogueSchema = Joi.object({
  productId: Joi.string()
    .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
    .allow(null)
    .optional(),
  dialogueId: Joi.string()
    .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
    .allow(null)
    .optional(),
  customerId: Joi.string()
    .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
    .allow(null)
    .optional(),
  sellerId: Joi.string()
    .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
    .allow(null)
    .optional(),
});

const getAllDialoguesSchema = Joi.object({
  statusDialogue: Joi.boolean().optional(),
});

const deleteDialogueNewMessageSchema = Joi.object({
  dialogueId: Joi.string().pattern(new RegExp("^[0-9a-fA-F]{24}$")).required(),
  arrayNewMessage: Joi.array().required(),
});

const orderDialogueSchema = Joi.object({
  productId: Joi.string()
    .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
    .allow(null)
    .optional(),
  productOwner: Joi.string()
    .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
    .allow(null)
    .optional(),
  typeDialogue: Joi.string()
    .valid(...dialogueType)
    .optional(),
  orderId: Joi.string()
    .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
    .allow(null)
    .optional(),
});

const schemas = {
  createDialogueSchema,
  getDialogueSchema,
  getAllDialoguesSchema,
  deleteDialogueNewMessageSchema,
  orderDialogueSchema,
};

const Dialogue = model("dialogue", dialogueSchema);

module.exports = {
  Dialogue,
  schemas,
};
