const { User } = require("../models/user");
const { Product } = require("../models/session");
const { processedFiles } = require("../helpers");

const { RequestError } = require("../helpers");

const addProductController = async (req, res) => {
  const { _id: owner } = req.user;

  const { category, shopName, description, price, userId, date } = req.body;
  console.log(category);

  const files = await processedFiles();
  console.log(files);
  // const user = await User.findOne(owner);

  // const { date, month, year, sex, email, firstName, lastName } = req.body;
  // const avatar = req.file;
  //   const { username, email, password } = req.body;
  //   const user = await User.findOne({ email });
  //   if (user) {
  //     throw RequestError(409, "Email in use");
  //   }

  //   const passwordHash = await bcrypt.hash(password, 10);

  //   const newUser = await User.create({
  //     username,
  //     email,
  //     passwordHash,
  //     userAddress: "",
  //     userBasket: [],
  //     userLikes: [],
  //     orders: [],
  //   });

  //   res.status(201).send({
  //     username: newUser.username,
  //     email: newUser.email,
  //     id: newUser._id,
  //   });
};

const deleteProductController = async (req, res) => {
  const { userId } = req.params;
  await User.findOneAndDelete({ _id: userId });
  const currentSession = req.session;
  await Session.deleteOne({ _id: currentSession._id });
  res.status(200).json({ message: "user deleted" });
};

module.exports = {
  addProductController,
  deleteProductController,
};
