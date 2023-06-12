const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");
const { Session } = require("../models/session");
const { SECRET_KEY, REFRESH_SECRET_KEY, FRONTEND_URL, FRONTEND_URL_GIT } =
  process.env;

const { RequestError } = require("../helpers");

const register = async (req, res) => {
  const { username, email, password, userAvatar } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw RequestError(409, "Email in use");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // const users = await User.find();

  // for (const user of users) {
  //   user.userAvatar = userAvatar; // оновлене значення

  //   await user.save(); // зберегти оновленого користувача
  // }

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

  return res.status(200).send({
    accessToken,
    refreshToken,
    sid: newSession._id,
    user: {
      email: user.email,
      username: user.username,
      id: user._id,
    },
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
  console.log(req.body);
  const result = await User.findOne({ _id });
  res.status(200).json(result);
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

  res.status(200).json(updatedUser);
};

const googleAuthController = async (req, res) => {
  const { _id: id, referer } = req.user;
  const paylaod = { id };

  const accessToken = jwt.sign(paylaod, SECRET_KEY, { expiresIn: "8h" });
  const refreshToken = jwt.sign(paylaod, REFRESH_SECRET_KEY, {
    expiresIn: "24h",
  });
  const newSession = await Session.create({
    uid: id,
  });

  res.redirect(
    `${referer}?accessToken=${accessToken}&refreshToken=${refreshToken}&sid=${newSession._id}`
  );
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
};
