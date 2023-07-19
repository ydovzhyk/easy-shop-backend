const { Dialogue } = require("../models/dialogue");
const { User } = require("../models/user");
const { Product } = require("../models/product");
const { NewMessage } = require("../models/newMessage");
const mongoose = require("mongoose");

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
      productOwner: mongoose.Types.ObjectId(productOwner),
      productOwnerAvatar: isProductOwner.userAvatar,
      statusDialogue: [
        { userOne: userId, status: true },
        { userTwo: mongoose.Types.ObjectId(productOwner), status: true },
      ],
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

const getAllDialoguesController = async (req, res) => {
  const { statusDialogue } = req.body;
  const userId = req.user._id;

  let dialoguesArray = [];
  if (statusDialogue) {
    dialoguesArray = await Dialogue.find({
      $or: [
        {
          "statusDialogue.userOne": userId,
          "statusDialogue.status": statusDialogue,
        },
        {
          "statusDialogue.userTwo": userId,
          "statusDialogue.status": statusDialogue,
        },
      ],
    });
  }
  console.log(dialoguesArray.length);

  const updatedDialoguesArray = [];
  for (const dialogue of dialoguesArray) {
    const productId = dialogue.productId;
    const product = await Product.findById(productId);

    let otherUserId = null;
    const userOneId = dialogue.userId;
    const userTwoId = dialogue.productOwner;
    if (userId.toString() === userOneId.toString()) {
      otherUserId = userTwoId;
    } else {
      otherUserId = userOneId;
    }

    const otherUser = await User.findById(otherUserId);

    const updatedDialogue = {
      ...dialogue._doc,
      productInfo: product,
      otherUserInfo: otherUser,
    };
    updatedDialoguesArray.push(updatedDialogue);
  }

  res.status(201).send({
    dialoguesArray: updatedDialoguesArray,
  });
};

const deleteDialogueController = async (req, res) => {
  const { dialogueId } = req.body;
  const userId = req.user._id;

  console.log(dialogueId);
  const dialogue = await Dialogue.findById(dialogueId);

  dialogue.statusDialogue.forEach((status) => {
    if (
      status.userOne.toString() === userId.toString() ||
      status.userTwo.toString() === userId.toString()
    ) {
      console.log("міняємо статус");
      status.status = false;
    }
  });

  await dialogue.save();

  res.status(200).json({ message: "Dialogue status updated successfully" });
};

const checkUpdates = async () => {
  const changeStream = Dialogue.watch();
  changeStream.on("change", async (change) => {
    const updateDescription = change.updateDescription;
    if (
      !updateDescription ||
      !updateDescription.updatedFields ||
      !updateDescription.updatedFields.messageArray
    ) {
      return;
    } else {
      const documentId = change.documentKey._id;
      const currentDialogue = await Dialogue.findById(documentId);
      const userOne = currentDialogue.userId;
      const userTwo = currentDialogue.productOwner;
      const productId = currentDialogue.productId;
      const latestMessage =
        currentDialogue.messageArray[currentDialogue.messageArray.length - 1];
      let userReceiver = "";
      if (String(userOne) === String(latestMessage.textOwner)) {
        userReceiver = userTwo;
      } else {
        userReceiver = userOne;
      }
      await NewMessage.create({
        messageArray: latestMessage,
        userReceiver: userReceiver,
        productId: productId,
        dialogue: documentId,
      });
      const totalNewMessage = await NewMessage.countDocuments({ userReceiver });
      await User.updateOne(
        { _id: userReceiver },
        { newMessage: totalNewMessage }
      );
    }
  });
};

const checkUpdatesDialogueController = async (data) => {
  const userId = data.userId;
  const newMessage = data.newMessage;
  console.log("Це дата в контроллері", userId, newMessage);
  const currentUser = await User.findById(userId);
  if (currentUser.newMessage !== newMessage) {
    console.log("Need to update");
    return { message: "Need to update" };
  } else {
    return { message: "No updates" };
  }
};

module.exports = {
  createDialogueController,
  getDialogueController,
  getAllDialoguesController,
  deleteDialogueController,
  checkUpdatesDialogueController,
  checkUpdates,
};
