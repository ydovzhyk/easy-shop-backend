const { Dialogue } = require("../models/dialogue");
const { User } = require("../models/user");
const { Product } = require("../models/product");
const { Order } = require("../models/order");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

const { RequestError, sendTechnicialMail } = require("../helpers/");

const createDialogueController = async (req, res, next) => {
  try {
    const { text, productId, productOwner, dialogueId, customerId, sellerId } =
      req.body;
    const userId = req.user._id;
    let isDialogue = null;
    const currentDate = moment().tz("Europe/Kiev").format("DD.MM.YYYY HH:mm");

    if (dialogueId) {
      isDialogue = await Dialogue.findOne({
        _id: dialogueId,
        productId: productId,
        $and: [
          {
            statusDialogue: {
              $elemMatch: {
                $or: [
                  { userOne: userId, status: true },
                  { userTwo: userId, status: true },
                  { userOne: userId, status: false },
                  { userTwo: userId, status: false },
                ],
              },
            },
          },
        ],
      });
    }

    if (customerId && !dialogueId) {
      isDialogue = await Dialogue.findOne({
        productId: productId,
        productOwner: userId,
        userId: customerId,
        $and: [
          {
            statusDialogue: {
              $elemMatch: {
                $or: [
                  { userOne: userId, status: true },
                  { userTwo: customerId, status: true },
                  { userOne: userId, status: false },
                  { userTwo: customerId, status: false },
                ],
              },
            },
          },
        ],
      });
    }

    if (sellerId && !dialogueId) {
      isDialogue = await Dialogue.findOne({
        productId: productId,
        productOwner: sellerId,
        userId: userId,
        $and: [
          {
            statusDialogue: {
              $elemMatch: {
                $or: [
                  { userOne: sellerId, status: true },
                  { userTwo: userId, status: true },
                  { userOne: sellerId, status: false },
                  { userTwo: userId, status: false },
                ],
              },
            },
          },
        ],
      });
    }

    if (!isDialogue && !customerId && !sellerId) {
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
    }
    // створюємо діалог на сторінці проданих товарів
    if (!isDialogue && customerId) {
      const otherUser = await User.findById(customerId);
      const newDialogue = await Dialogue.create({
        messageArray: { text: text, date: currentDate, textOwner: userId },
        userId: mongoose.Types.ObjectId(customerId),
        userAvatar: otherUser.userAvatar,
        productId,
        productOwner: userId,
        productOwnerAvatar: req.user.userAvatar,
        statusDialogue: [
          { userOne: userId, status: true },
          { userTwo: mongoose.Types.ObjectId(customerId), status: true },
        ],
        newMessages: [
          {
            userReceiver: mongoose.Types.ObjectId(customerId),
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
        { _id: customerId },
        {
          $push: { userDialogue: newDialogue._id },
          $inc: { newMessage: 1 },
        }
      );

      res.status(201).send({
        user: updatedUser,
        userDialogue: newDialogue,
      });
    }

    // створюємо діалог на сторінці куплених товарів
    if (!isDialogue && sellerId) {
      const otherUser = await User.findById(sellerId);
      const newDialogue = await Dialogue.create({
        messageArray: { text: text, date: currentDate, textOwner: userId },
        userId: userId,
        userAvatar: req.user.userAvatar,
        productId,
        productOwner: mongoose.Types.ObjectId(sellerId),
        productOwnerAvatar: otherUser.userAvatar,
        statusDialogue: [
          { userOne: mongoose.Types.ObjectId(sellerId), status: true },
          { userTwo: userId, status: true },
        ],
        newMessages: [
          {
            userReceiver: mongoose.Types.ObjectId(sellerId),
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
        { _id: sellerId },
        {
          $push: { userDialogue: newDialogue._id },
          $inc: { newMessage: 1 },
        }
      );

      res.status(201).send({
        user: updatedUser,
        userDialogue: newDialogue,
      });
    }

    if (isDialogue) {
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
  } catch (error) {
    next(error);
  }
};

const getDialogueController = async (req, res, next) => {
  try {
    const { productId, dialogueId, customerId } = req.body;
    const userId = req.user._id;

    let reqDialogue = [];
    //перевіряємо діалог на сторінці продукту
    if (productId && !dialogueId && !customerId) {
      const product = await Product.findOne({ _id: productId });
      const productOwner = product.owner;
      reqDialogue = await Dialogue.findOne({
        $or: [{ userId: userId }, { productOwner: productOwner }],
        productId: productId,
        $and: [
          {
            statusDialogue: {
              $elemMatch: {
                $or: [
                  { userOne: userId, status: true },
                  { userTwo: userId, status: true },
                  { userOne: userId, status: false },
                  { userTwo: userId, status: false },
                ],
              },
            },
          },
        ],
      });
    }
    // перевіряємо діалог на сторінці куплиних товарів
    if (productId && !dialogueId && customerId) {
      reqDialogue = await Dialogue.findOne({
        productId: productId,
        productOwner: userId,
        userId: customerId,
        $and: [
          {
            statusDialogue: {
              $elemMatch: {
                $or: [
                  { userOne: userId, status: true },
                  { userTwo: customerId, status: true },
                  { userOne: userId, status: false },
                  { userTwo: customerId, status: false },
                ],
              },
            },
          },
        ],
      });
    }
    // перевіряємо діалог на сторінці повідомлень
    if (dialogueId && !customerId) {
      reqDialogue = await Dialogue.findOne({
        _id: dialogueId,
        $and: [
          {
            statusDialogue: {
              $elemMatch: {
                $or: [
                  { userOne: userId, status: true },
                  { userTwo: userId, status: true },
                  { userOne: userId, status: false },
                  { userTwo: userId, status: false },
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
  } catch (error) {
    next(error);
  }
};

const getAllDialoguesController = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const deleteDialogueController = async (req, res, next) => {
  try {
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
        (el.userOne ? el.userOne.toString() : el.userOne) ===
          userId.toString() &&
        el.status === true
      ) {
        newStatusDialogue.push({ userOne: el.userOne, status: false });
        numberOperation.push(1);
      } else if (
        (el.userTwo ? el.userTwo.toString() : el.userTwo) ===
          userId.toString() &&
        el.status === true
      ) {
        newStatusDialogue.push({ userTwo: el.userTwo, status: false });
        numberOperation.push(2);
      } else if (
        (el.userOne ? el.userOne.toString() : el.userOne) ===
          userId.toString() &&
        el.status === false
      ) {
        newStatusDialogue.push({ userOne: null, status: null });
        numberOperation.push(3);
      } else if (
        (el.userTwo ? el.userTwo.toString() : el.userTwo) ===
          userId.toString() &&
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
  } catch (error) {
    next(error);
  }
};

const deleteDialogueNewMessageController = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const checkUpdatesDialogueController = async (data) => {
  const userId = data.userId;
  const newMessage = data.newMessage;
  const currentUser = await User.findById(userId);
  if (currentUser.newMessage !== newMessage) {
    return { message: true };
  } else {
    return { message: false };
  }
};

const orderDialogueController = async (req, res, next) => {
  try {
    const { productId, productOwner, typeDialogue, orderId } = req.body;
    const user = req.user;
    const infoId = "64cccb7e5b8c2eb706fe655d";
    const info = await User.findOne({ _id: infoId });
    let textOwner = null;
    let textUser = null;
    let product = null;
    let owner = null;

    if (typeDialogue === "checkout") {
      product = await Product.findById(productId);
      owner = await User.findById(productOwner);

      textOwner = `Добрий день, ваш товар: ${product.nameProduct} замовлений користувачем ${user.username}. Перейдіть у ваш профіль, щоб підтвердити чи відхилити угоду.`;
      textUser = `Добрий день, ви замовили товар: ${product.nameProduct} у користувача ${owner.username}. Перейдіть у ваш профіль, щоб переглянути статус замовлення.`;
    }

    if (typeDialogue === "sales") {
      const order = await Order.findById(orderId);
      const numberProducts = order.products.length;
      const productOwner = order.client.customerId;
      owner = await User.findById(productOwner);
      if (numberProducts === 1) {
        const productId = order.products[0]._id;
        product = await Product.findById(productId);

        textUser = `Добрий день, ви підтвердили замовлення №${order.orderNumber} на товар: ${product.nameProduct}. Якщо у вас виникли якісь запитання до користувача ${owner.username}, зв'яжіться з ним через повідомлення на сайті.`;
        textOwner = `Добрий день, користувач ${user.username} підтвердив ваше замовлення №${order.orderNumber} на товар: ${product.nameProduct}. Якщо у вас виникли якісь запитання до користувача ${user.username}, зв'яжіться з ним через повідомлення на сайті.`;
      }
      if (numberProducts > 1) {
        let productNames = [];
        const productId = order.products[0]._id;
        product = await Product.findById(productId);

        const getProductName = async (productId) => {
          const product = await Product.findById(productId);
          return product.nameProduct;
        };

        await Promise.all(
          order.products.map(async (product) => {
            const nameProduct = await getProductName(product._id);
            productNames.push(nameProduct);
          })
        );

        textUser = `Добрий день, ви підтвердили замовлення №${
          order.orderNumber
        } на товари: ${productNames.join(
          ", "
        )}. Якщо у вас виникли якісь запитання до користувача ${
          owner.username
        }, зв'яжіться з ним через повідомлення на сайті.`;
        textOwner = `Добрий день, користувач ${
          user.username
        } підтвердив ваше замовлення №${
          order.orderNumber
        } на товари: ${productNames.join(
          ", "
        )}. Якщо у вас виникли якісь запитання до користувача ${
          user.username
        }, зв'яжіться з ним через повідомлення на сайті.`;
      }
    }

    if (typeDialogue === "cancel") {
      const order = await Order.findById(orderId);
      const numberProducts = order.products.length;
      const productOwner = order.client.customerId;
      owner = await User.findById(productOwner);
      if (numberProducts === 1) {
        const productId = order.products[0]._id;
        product = await Product.findById(productId);

        textUser = `Добрий день, ви відхилили замовлення №${order.orderNumber} на товар: ${product.nameProduct}. Зв'яжіться з користувачем ${owner.username} через повідомлення на сайті, для уточнення деталей.`;
        textOwner = `Добрий день, користувач ${user.username} відхилив ваше замовлення №${order.orderNumber} на товар: ${product.nameProduct}. Зв'яжіться з користувачем ${user.username} через повідомлення на сайті, для уточнення деталей.`;
      }
      if (numberProducts > 1) {
        let productNames = [];
        const productId = order.products[0]._id;
        product = await Product.findById(productId);

        const getProductName = async (productId) => {
          const product = await Product.findById(productId);
          return product.nameProduct;
        };

        await Promise.all(
          order.products.map(async (product) => {
            const nameProduct = await getProductName(product._id);
            productNames.push(nameProduct);
          })
        );

        textUser = `Добрий день, ви відхилили замовлення №${
          order.orderNumber
        } на товари: ${productNames.join(", ")}. Зв'яжіться з користувачем ${
          owner.username
        } через повідомлення на сайті, для уточнення деталей.`;
        textOwner = `Добрий день, користувач ${
          user.username
        } відхилив ваше замовлення №${
          order.orderNumber
        } на товари: ${productNames.join(", ")}. Зв'яжіться з користувачем ${
          user.username
        } через повідомлення на сайті, для уточнення деталей.`;
      }
    }

    sendTechnicialMail(user.email, textUser, owner.email, textOwner);

    const currentDate = moment().tz("Europe/Kiev").format("DD.MM.YYYY HH:mm");
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
        productId: product._id,
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
        { $push: { userDialogue: newDialogue._id } }
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
          productId: product._id,
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
        userId: info._id,
        userAvatar: info.userAvatar,
        productId: product._id,
        productOwner: user._id,
        productOwnerAvatar: user.userAvatar,
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
        ...isDialogueUser.newMessages,
        {
          userReceiver: user._id,
          message: textUser,
          date: currentDate,
        },
      ];

      await Dialogue.findOneAndUpdate(
        { _id: isDialogueUser._id },
        {
          messageArray: updatedMessageArray,
          newMessages: updatedNewMessages,
          productId: product._id,
        }
      );

      await User.findOneAndUpdate(
        { _id: user._id },
        { $inc: { newMessage: 1 } }
      );

      res.status(201).send({ message: "Message successfully sending" });
    }
  } catch (error) {
    next(error);
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
