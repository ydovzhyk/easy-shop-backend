const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");
const { Session } = require("../models/session");
const { SECRET_KEY, REFRESH_SECRET_KEY } = process.env;

const { RequestError } = require("../helpers");

const register = async (req, res) => {
  const { username, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw RequestError(409, "Email in use");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    passwordHash,
    userAddress: "",
    userBasket: [],
    userLikes: [],
    orders: [],
  });

  res.status(201).send({
    username: newUser.username,
    email: newUser.email,
    id: newUser._id,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw RequestError(401, "Invalid email or password");
  }
  const passwordCompare = await bcrypt.compare(password, user.passwordHash);
  if (!passwordCompare) {
    throw RequestError(401, "Invalid email or password");
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

  const date = new Date();
  const today = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;

  // const todaySummary = await Summary.findOne({ date: today });

  // if (!todaySummary) {
  return res.status(200).send({
    accessToken,
    refreshToken,
    sid: newSession._id,
    user: {
      email: user.email,
      username: user.username,
      userAddress: user.userAddress,
      userBasket: user.userBasket,
      userLikes: user.userLikes,
      orders: user.orders,
      id: user._id,
    },
  });
  // }
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

const logout = async (req, res) => {
  const authorizationHeader = req.get("Authorization");
  if (authorizationHeader) {
    const accessToken = authorizationHeader.replace("Bearer ", "");
    let payload = {};
    try {
      payload = jwt.verify(accessToken, SECRET_KEY);
    } catch (err) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const user = await User.findById(payload.id);
    await Session.findOneAndDelete({ uid: user._id });
    return res.status(204).json({ message: "logout success" });
  } else {
    return res.status(204).json({ message: "logout success" });
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
  const result = await User.findOne({ _id });
  res.status(200).json(result);
};

module.exports = {
  register,
  login,
  logout,
  deleteUserController,
  refresh,
  getUserController,
};
