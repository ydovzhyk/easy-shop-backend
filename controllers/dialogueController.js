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

    await User.findOneAndUpdate(
      { _id: productOwner },
      {
        $push: { userDialogue: newDialogue._id },
        $inc: { newMessage: 1 },
      }
    );

    res.status(201).send({
      user: updatedUser,
      userDialogue: newDialogue,
    });
  } else {
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

    await User.findOneAndUpdate(
      { _id: userReceiver },
      { $inc: { newMessage: 1 } }
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
  const sortedDialogues = updatedDialoguesArray.sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
  res.status(201).send({
    dialoguesArray: sortedDialogues,
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
    { _id: dialogueId },
    { $set: { statusDialogue: newStatusDialogue } }
  );

  if (numberOperation.includes(1) || numberOperation.includes(2)) {
    res
      .status(200)
      .json({ message: "You can find your dialogue in the archive" });
  } else if (numberOperation.includes(3) || numberOperation.includes(4)) {
    res.status(200).json({ message: "You have left a dialog with the user" });
  }
};

const deleteDialogueNewMessageController = async (req, res) => {
  const { dialogueId, arrayNewMessage } = req.body;
  const userId = req.user._id;
  const reqDialogue = await Dialogue.findById(dialogueId);
  const arrayNewMessages = reqDialogue.newMessages;

  const filteredNewMessages = arrayNewMessages.filter((messageObj) => {
    return !arrayNewMessage.some((message) => {
      return (
        messageObj.userReceiver.toString() ===
          message.userReceiver.toString() &&
        messageObj.message === message.message &&
        messageObj.date === message.date
      );
    });
  });

  const user = await User.findById(userId);
  const numberNewMessage = user.newMessage;
  const updatedNumberNewMessage =
    numberNewMessage - (arrayNewMessages.length - filteredNewMessages.length);

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { newMessage: updatedNumberNewMessage },
    { new: true }
  );

  const updatedDialogue = await Dialogue.findOneAndUpdate(
    { _id: dialogueId },
    { newMessages: filteredNewMessages }
  );

  res.status(201).send({
    userDialogue: updatedDialogue,
    user: updatedUser,
  });
};

const checkUpdatesDialogueController = async (data) => {
  const userId = data.userId;
  const newMessage = data.newMessage;
  console.log("Це дата в контроллері", userId, newMessage);
  const currentUser = await User.findById(userId);
  if (currentUser.newMessage !== newMessage) {
    return { message: true };
  } else {
    return { message: false };
  }
};

const orderDialogueController = async (req, res) => {
  const { productId, productOwner } = req.body;
  const user = req.user;
  const product = await Product.findById(productId);
  const owner = await User.findById(productOwner);
  const infoId = "64cccb7e5b8c2eb706fe655d";
  const info = await User.findOne({ _id: infoId });

  const textOwner = `Добрий день, ваш товар: ${product.nameProduct} замовлений користувачем ${user.userName}. Перейдіть у ваш профіль щоб підтвердити чи відхилити угоду.`;
  const textUser = `Добрий день, ви замовили товар: ${product.nameProduct} у користувача ${owner.username}. Перейдіть у ваш профіль щоб переглянути статус замовлення.`;

  const currentDate = moment().format("DD.MM.YYYY HH:mm");
  // шукаємо діалог info з owner товару
  const isDialogueOwner = await Dialogue.findOne({
    $and: [
      {
        statusDialogue: {
          $elemMatch: {
            userOne: info._id,
            status: true,
          },
        },
      },
      {
        statusDialogue: {
          $elemMatch: {
            userTwo: owner._id,
            status: true,
          },
        },
      },
    ],
  });

  // шукаємо діалог з info і user
  const isDialogueUser = await Dialogue.findOne({
    $and: [
      {
        statusDialogue: {
          $elemMatch: {
            userOne: info._id,
            status: true,
          },
        },
      },
      {
        statusDialogue: {
          $elemMatch: {
            userTwo: user._id,
            status: true,
          },
        },
      },
    ],
  });

  if (!isDialogueOwner) {
    const newDialogue = await Dialogue.create({
      messageArray: {
        text: textOwner,
        date: currentDate,
        textOwner: info._id,
      },
      userId: info._id,
      userAvatar: info.userAvatar,
      productId: productId,
      productOwner: owner._id,
      productOwnerAvatar: owner.userAvatar,
      statusDialogue: [
        { userOne: info._id, status: true },
        { userTwo: owner._id, status: true },
      ],
      newMessages: [
        {
          userReceiver: owner._id,
          message: textOwner,
          date: currentDate,
        },
      ],
    });

    await User.findOneAndUpdate(
      { _id: info._id },
      { $push: { userDialogue: newDialogue._id } },
      { new: true }
    );

    await User.findOneAndUpdate(
      { _id: owner._id },
      {
        $push: { userDialogue: newDialogue._id },
        $inc: { newMessage: 1 },
      }
    );

    res.status(201).send({ message: "Message successfully sending" });
  } else {
    const updatedMessageArray = [
      ...isDialogueOwner.messageArray,
      {
        text: textOwner,
        date: currentDate,
        textOwner: info._id,
      },
    ];

    const updatedNewMessages = [
      ...isDialogueOwner.newMessages,
      {
        userReceiver: owner._id,
        message: textOwner,
        date: currentDate,
      },
    ];

    await Dialogue.findOneAndUpdate(
      { _id: isDialogueOwner._id },
      {
        messageArray: updatedMessageArray,
        newMessages: updatedNewMessages,
        productId: productId,
      }
    );

    await User.findOneAndUpdate(
      { _id: owner._id },
      { $inc: { newMessage: 1 } }
    );

    res.status(201).send({ message: "Message successfully sending" });
  }

  if (!isDialogueUser) {
    const newDialogue = await Dialogue.create({
      messageArray: {
        text: textUser,
        date: currentDate,
        textOwner: info._id,
      },
      userId: user._id,
      userAvatar: user.userAvatar,
      productId: productId,
      productOwner: info._id,
      productOwnerAvatar: info.userAvatar,
      statusDialogue: [
        { userOne: info._id, status: true },
        { userTwo: user._id, status: true },
      ],
      newMessages: [
        {
          userReceiver: user._id,
          message: textUser,
          date: currentDate,
        },
      ],
    });

    await User.findOneAndUpdate(
      { _id: info._id },
      { $push: { userDialogue: newDialogue._id } }
    );

    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $push: { userDialogue: newDialogue._id },
        $inc: { newMessage: 1 },
      }
    );

    res.status(201).send({ message: "Message successfully sending" });
  } else {
    const updatedMessageArray = [
      ...isDialogueUser.messageArray,
      {
        text: textUser,
        date: currentDate,
        textOwner: info._id,
      },
    ];

    const updatedNewMessages = [
      ...isDialogueOwner.newMessages,
      {
        userReceiver: userId,
        message: textUser,
        date: currentDate,
      },
    ];

    await Dialogue.findOneAndUpdate(
      { _id: isDialogueUser._id },
      {
        messageArray: updatedMessageArray,
        newMessages: updatedNewMessages,
        productId: productId,
      }
    );

    await User.findOneAndUpdate({ _id: user._id }, { $inc: { newMessage: 1 } });

    res.status(201).send({ message: "Message successfully sending" });
  }
};

module.exports = {
  createDialogueController,
  getDialogueController,
  getAllDialoguesController,
  deleteDialogueController,
  deleteDialogueNewMessageController,
  checkUpdatesDialogueController,
  orderDialogueController,
  // checkUpdates,
};
