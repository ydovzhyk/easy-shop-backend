const { Dialogue } = require("../models/dialogue");
const { User } = require("../models/user");
const { Product } = require("../models/product");
const mongoose = require("mongoose");

const { RequestError } = require("../helpers/");
const moment = require("moment");

const createDialogueController = async (req, res) => {
  const { text, productId, productOwner, dialogueId } = req.body;

  const userId = req.user._id;

  const currentDate = moment().format("DD.MM.YYYY HH:mm");

  const isDialogue = await Dialogue.findOne({
    _id: dialogueId,
    productId: productId,
    $and: [
      {
        statusDialogue: {
          $elemMatch: {
            $or: [
              { userOne: userId, status: true },
              { userTwo: userId, status: true },
            ],
          },
        },
      },
    ],
  });

  if (!isDialogue) {
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
      newMessages: [
        {
          userReceiver: productOwner,
          message: text,
          date: currentDate,
        },
      ],
    });

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { userDialogue: newDialogue._id } },
      { new: true }
    );

    const updatedReciverUser = await User.findOneAndUpdate(
      { _id: productOwner },
      {
        $push: { userDialogue: newDialogue._id },
      },
      { new: true }
    );

    let newMessageValue = parseInt(updatedReciverUser.newMessage);
    newMessageValue += 1;

    await User.findOneAndUpdate(
      { _id: productOwner },
      { newMessage: newMessageValue.toString() }
    );

    res.status(201).send({
      user: updatedUser,
      userDialogue: newDialogue,
    });
  } else {
    console.log("Зайшли продовжити діалог");
    let userReceiver = null;
    const userOne = isDialogue.userId;
    const userTwo = isDialogue.productOwner;

    if (userOne.toString() === userId.toString()) {
      userReceiver = userTwo;
    } else {
      userReceiver = userOne;
    }

    const updatedMessageArray = [
      ...isDialogue.messageArray,
      {
        text: text,
        date: currentDate,
        textOwner: userId,
      },
    ];

    const updatedNewMessages = [
      ...isDialogue.newMessages,
      {
        userReceiver: userReceiver,
        message: text,
        date: currentDate,
      },
    ];

    const updatedDialogue = await Dialogue.findOneAndUpdate(
      { _id: isDialogue._id },
      { messageArray: updatedMessageArray, newMessages: updatedNewMessages },
      { new: true }
    );

    const updatedReciverUser = await User.findOne({ _id: userReceiver });

    console.log(updatedReciverUser);

    let newMessageValue = parseInt(updatedReciverUser.newMessage);
    newMessageValue += 1;

    console.log(newMessageValue);

    await User.findOneAndUpdate(
      { _id: userReceiver },
      { newMessage: newMessageValue.toString() }
    );

    res.status(201).send({
      user: req.user,
      userDialogue: updatedDialogue,
    });
  }
};

const getDialogueController = async (req, res) => {
  const { productId, dialogueId } = req.body;
  const userId = req.user._id;

  let reqDialogue = [];

  if (productId && !dialogueId) {
    reqDialogue = await Dialogue.findOne({
      $or: [{ userId: userId }, { productOwner: userId }],
      productId: productId,
      $and: [
        {
          statusDialogue: {
            $elemMatch: {
              $or: [
                { userOne: userId, status: true },
                { userTwo: userId, status: true },
              ],
            },
          },
        },
      ],
    });
  } else {
    reqDialogue = await Dialogue.findOne({
      _id: dialogueId,
      $and: [
        {
          statusDialogue: {
            $elemMatch: {
              $or: [
                { userOne: userId, status: true },
                { userTwo: userId, status: true },
              ],
            },
          },
        },
      ],
    });
  }

  if (!reqDialogue) {
    res.status(201).send({
      userDialogue: [],
    });
  } else {
    res.status(201).send({
      userDialogue: reqDialogue,
    });
  }
};

const getAllDialoguesController = async (req, res) => {
  const { statusDialogue } = req.body;
  const userId = req.user._id;

  let dialoguesArray = [];
  dialoguesArray = await Dialogue.find({
    $or: [
      {
        statusDialogue: {
          $elemMatch: {
            userOne: userId,
            status: statusDialogue,
          },
        },
      },
      {
        statusDialogue: {
          $elemMatch: {
            userTwo: userId,
            status: statusDialogue,
          },
        },
      },
    ],
  });

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

  const dialogue = await Dialogue.findOne({
    _id: dialogueId,
  });

  const statusDialogue = dialogue.statusDialogue;

  let newStatusDialogue = [];
  let numberOperation = [];

  for (const el of statusDialogue) {
    if (
      (el.userOne ? el.userOne.toString() : el.userOne) === userId.toString() &&
      el.status === true
    ) {
      newStatusDialogue.push({ userOne: el.userOne, status: false });
      numberOperation.push(1);
    } else if (
      (el.userTwo ? el.userTwo.toString() : el.userTwo) === userId.toString() &&
      el.status === true
    ) {
      newStatusDialogue.push({ userTwo: el.userTwo, status: false });
      numberOperation.push(2);
    } else if (
      (el.userOne ? el.userOne.toString() : el.userOne) === userId.toString() &&
      el.status === false
    ) {
      newStatusDialogue.push({ userOne: null, status: null });
      numberOperation.push(3);
    } else if (
      (el.userTwo ? el.userTwo.toString() : el.userTwo) === userId.toString() &&
      el.status === false
    ) {
      newStatusDialogue.push({ userTwo: null, status: null });
      numberOperation.push(4);
    } else {
      newStatusDialogue.push(el);
      numberOperation.push(5);
    }
  }

  await Dialogue.findOneAndUpdate(
    {
      _id: dialogueId,
    },
    {
      $set: { statusDialogue: newStatusDialogue },
    }
  );

  if (numberOperation.includes(1) || numberOperation.includes(2)) {
    res
      .status(200)
      .json({ message: "You can find your dialogue in the archive" });
  } else if (numberOperation.includes(3) || numberOperation.includes(4)) {
    res.status(200).json({ message: "You have left a dialog with the user" });
  }
};

// const checkUpdates = async () => {
//   const changeStream = Dialogue.watch();
//   changeStream.on("change", async (change) => {
//     const updateDescription = change.updateDescription;
//     if (
//       !updateDescription ||
//       !updateDescription.updatedFields ||
//       !updateDescription.updatedFields.messageArray
//     ) {
//       return;
//     } else {
//       const documentId = change.documentKey._id;
//       const currentDialogue = await Dialogue.findById(documentId);
//       const userOne = currentDialogue.userId;
//       const userTwo = currentDialogue.productOwner;
//       const productId = currentDialogue.productId;
//       const latestMessage =
//         currentDialogue.messageArray[currentDialogue.messageArray.length - 1];
//       let userReceiver = "";
//       if (String(userOne) === String(latestMessage.textOwner)) {
//         userReceiver = userTwo;
//       } else {
//         userReceiver = userOne;
//       }
//       const newMessage = {
//         messageArray: latestMessage,
//         userReceiver: userReceiver,
//         productId: productId,
//       };

//       console.log(newMessage);

//       const updatedDialogue = await Dialogue.findByIdAndUpdate(
//         documentId,
//         { $push: { newMessages: newMessage } },
//         { new: true }
//       );

//       console.log(updatedDialogue);
//       const totalNewMessage = await NewMessage.countDocuments({ userReceiver });
//       await User.updateOne(
//         { _id: userReceiver },
//         { newMessage: totalNewMessage }
//       );
//     }
//   });
// };

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
  // checkUpdates,
};
