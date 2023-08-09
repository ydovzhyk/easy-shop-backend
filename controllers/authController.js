const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");
const { Session } = require("../models/session");
const { v4: uuidv4 } = require("uuid");
const { SECRET_KEY, REFRESH_SECRET_KEY, FRONTEND_URL, FRONTEND_URL_GIT } =
  process.env;

const { RequestError, sendMail } = require("../helpers");
const { Product } = require("../models/product");

const register = async (req, res) => {
  const { username, email, password, userAvatar } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw RequestError(409, "Email in use");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const date = new Date();
  const today = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;

  const newUser = await User.create({
    username,
    email,
    passwordHash,
    userAvatar,
    dateCreate: today,
  });

  res.status(201).send({
    username: newUser.username,
    email: newUser.email,
    id: newUser._id,
    userAvatar: newUser.userAvatar,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw RequestError(400, "Invalid email or password");
  }
  const passwordCompare = await bcrypt.compare(password, user.passwordHash);
  if (!passwordCompare) {
    throw RequestError(400, "Invalid email or password");
  }
  const paylaod = {
    id: user._id,
  };
  const accessToken = jwt.sign(paylaod, SECRET_KEY, { expiresIn: "8h" });
  const refreshToken = jwt.sign(paylaod, REFRESH_SECRET_KEY, {
    expiresIn: "24h",
  });
  const newSession = await Session.create({
    uid: user._id,
  });

  return res.status(200).send({
    accessToken,
    refreshToken,
    sid: newSession._id,
    user,
  });
};

const refresh = async (req, res, next) => {
  const user = req.user;
  await Session.deleteMany({ uid: req.user._id });
  const paylaod = { id: user._id };
  const newSession = await Session.create({ uid: user._id });
  const newAccessToken = jwt.sign(paylaod, SECRET_KEY, { expiresIn: "8h" });
  const newRefreshToken = jwt.sign(paylaod, REFRESH_SECRET_KEY, {
    expiresIn: "24h",
  });

  return res
    .status(200)
    .send({ newAccessToken, newRefreshToken, sid: newSession._id });
};

const logout = async (req, res, next) => {
  const user = req.user;
  try {
    await Session.deleteMany({ uid: user._id });
    return res.status(204).json({ message: "logout success" });
  } catch (error) {
    return next(RequestError(404, "Session Not found"));
  }
};

const deleteUserController = async (req, res) => {
  const { userId } = req.params;
  await User.findOneAndDelete({ _id: userId });
  const currentSession = req.session;
  await Session.deleteOne({ _id: currentSession._id });
  res.status(200).json({ message: "user deleted" });
};

const getUserController = async (req, res) => {
  const { _id } = req.user;
  const { accessToken, refreshToken, sid } = req.body;
  const user = await User.findOneAndUpdate(
    { _id },
    { lastVisit: new Date() },
    { new: true }
  );
  return res.status(200).send({
    accessToken,
    refreshToken,
    sid,
    user,
  });
};

const updateUserSettigsController = async (req, res) => {
  const { _id } = req.user;
  const {
    userAvatar,
    cityName,
    email,
    firstName,
    surName,
    houseNamber,
    streetName,
    secondName,
    sex,
    tel,
    about,
  } = req.body;
  const user = await User.findOne({ _id });
  const updatedUser = await User.findOneAndUpdate(
    { _id },
    {
      userAvatar: userAvatar ? userAvatar : user.userAvatar,
      cityName: cityName ? cityName : user.cityName,
      email: email ? email : user.email,
      firstName: firstName ? firstName : user.firstName,
      surName: surName ? surName : user.surName,
      houseNamber: houseNamber ? houseNamber : user.houseNamber,
      streetName: streetName ? streetName : user.streetName,
      secondName: secondName ? secondName : user.secondName,
      sex: sex ? sex : user.sex,
      tel: tel ? tel : user.tel,
      about: about ? about : user.about,
    },
    { new: true }
  );

  res
    .status(200)
    .json({ message: "Data updated successfully", user: updatedUser });
};

const googleAuthController = async (req, res) => {
  const { _id: id, referer } = req.user;
  const paylaod = { id };

  let senderUrl = "";
  if (referer.includes("https://ydovzhyk.github.io")) {
    senderUrl = "https://ydovzhyk.github.io/easy-shop/";
  } else if (referer.includes("http://localhost:3000")) {
    senderUrl = "http://localhost:3000/";
  } else {
    senderUrl = referer;
  }

  const accessToken = jwt.sign(paylaod, SECRET_KEY, { expiresIn: "8h" });
  const refreshToken = jwt.sign(paylaod, REFRESH_SECRET_KEY, {
    expiresIn: "24h",
  });
  const newSession = await Session.create({
    uid: id,
  });

  res.redirect(
    `${senderUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}&sid=${newSession._id}`
  );
};

const updateUserBasket = async (req, res, next) => {
  const { _id } = req.user;
  const user = await User.findOne({ _id });
  const { productId, selectedSizes } = req.body;

  let userBasket = user.userBasket || [];

  let updatedUserBasket = [];
  let productExists = false;

  if (productId && selectedSizes) {
    for (const item of userBasket) {
      if (item.productId === productId) {
        updatedUserBasket.push({
          productId: productId,
          selectedSizes: selectedSizes,
        });
        productExists = true;
      } else {
        updatedUserBasket.push(item);
      }
    }

    if (!productExists) {
      updatedUserBasket.push({
        productId: productId,
        selectedSizes: selectedSizes,
      });
    }

    userBasket = updatedUserBasket;
  } else {
    updatedUserBasket = userBasket.filter(
      (item) => item.productId !== productId
    );
    userBasket = updatedUserBasket;
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { userBasket },
    { new: true }
  );

  const lastBasket = updatedUser.userBasket;
  const productIds = lastBasket.map((item) => {
    return item.productId;
  });
  const basketProducts = await Product.find({ _id: { $in: productIds } });

  return res.status(200).json({ updatedUser, basketProducts });
};

const updateUserLikes = async (req, res, next) => {
  const { _id } = req.user;
  const { productId } = req.body;

  const user = await User.findOne({ _id });
  let userLikes = user.userLikes || [];

  if (!userLikes.includes(productId)) {
    userLikes.push(productId);
  } else {
    const updatedUserLikes = userLikes.filter(
      (id) => id.toString() !== productId
    );
    userLikes = updatedUserLikes;
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { userLikes },
    { new: true }
  );

  const product = await Product.findById(productId);
  let userLikesProduct = product.userLikes || [];

  if (!userLikesProduct.includes(_id)) {
    userLikesProduct.push(_id);
  } else {
    const updatedUserLikes = userLikesProduct.filter((id) => !id.equals(_id));
    userLikesProduct = updatedUserLikes;
  }

  await Product.findByIdAndUpdate(
    product._id,
    { userLikes: userLikesProduct },
    { new: true }
  );

  const lastLikes = updatedUser.userLikes;
  const likedProducts = await Product.find({
    _id: { $in: lastLikes },
  });

  return res.status(200).json({ updatedUser, likedProducts });
};

const getUserLikesBasket = async (req, res, next) => {
  const { _id } = req.user;

  const page = req.body.currentPage || 1;
  const limit = 5;

  const user = await User.findOne({ _id });
  const userLikes = user.userLikes || [];
  const userBasket = user.userBasket || [];

  const totalLikedProducts = await Product.find({
    _id: { $in: userLikes },
  });
  const count = totalLikedProducts.length;
  const totalLikedPages = Math.ceil(count / limit);
  const skip = (page - 1) * limit;

  const likedProducts = totalLikedProducts.slice(skip, skip + limit);

  const productIds = userBasket.map((item) => {
    return item.productId;
  });
  const basketProducts = await Product.find({ _id: { $in: productIds } });

  return res
    .status(200)
    .json({ likedProducts, basketProducts, totalLikedPages });
};

module.exports = {
  register,
  login,
  logout,
  deleteUserController,
  refresh,
  getUserController,
  updateUserSettigsController,
  googleAuthController,
  updateUserBasket,
  updateUserLikes,
  getUserLikesBasket,
};
