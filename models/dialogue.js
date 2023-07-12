const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

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
  },
  { versionKey: false, timestamps: true }
);

dialogueSchema.post("save", handleSaveErrors);

const addDialogueSchema = Joi.object({
  uid: Joi.string().required(),
});

const schemas = {
  addDialogueSchema,
};

const Dialogue = model("dialogue", dialogueSchema);

module.exports = {
  Dialogue,
  schemas,
};
