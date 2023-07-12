const { Dialogue } = require("../models/dialogue");
const { User } = require("../models/user");
const { Product } = require("../models/product");

const { RequestError } = require("../helpers/");
const moment = require("moment");

const createDialogueController = async (req, res) => {
  const { text, productId, productOwner, dialogueId } = req.body;

  const userId = req.user._id;

  const currentDate = moment().format("DD.MM.YYYY HH:mm");

  const isDialogue = await Dialogue.find({
    _id: dialogueId,
    productId: productId,
  });

  if (isDialogue.length === 0) {
    const isProductOwner = await User.findById(productOwner);
    const newDialogue = await Dialogue.create({
      messageArray: { text: text, date: currentDate, textOwner: userId },
      userId,
      userAvatar: req.user.userAvatar,
      productId,
      productOwner,
      productOwnerAvatar: isProductOwner.userAvatar,
    });

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { userDialogue: newDialogue._id, productId: productId } },
      { new: true }
    );

    await User.findOneAndUpdate(
      { _id: productOwner },
      { $push: { userDialogue: newDialogue._id, productId: productId } },
      { new: true }
    );

    await Product.findOneAndUpdate(
      { _id: productId },
      { $push: { userDialogue: newDialogue._id } },
      { new: true }
    );

    res.status(201).send({
      user: updatedUser,
      userDialogue: newDialogue,
    });
  } else {
    const updatedMessageArray = [
      ...isDialogue[0].messageArray,
      {
        text: text,
        date: currentDate,
        textOwner: userId,
      },
    ];

    const updatedDialogue = await Dialogue.findOneAndUpdate(
      { _id: isDialogue[0]._id },
      { messageArray: updatedMessageArray },
      { new: true }
    );

    res.status(201).send({
      user: req.user,
      userDialogue: updatedDialogue,
    });
  }
};

const getDialogueController = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  const reqDialogue = await Dialogue.find({
    $or: [{ userId: userId }, { productOwner: userId }],
    productId: productId,
  });

  if (reqDialogue.length === 0) {
    res.status(201).send({
      userDialogue: [],
    });
  } else {
    res.status(201).send({
      userDialogue: reqDialogue[0],
    });
  }
};

module.exports = {
  createDialogueController,
  getDialogueController,
};
