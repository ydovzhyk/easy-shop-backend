const { User } = require("../models/user");
const { Product } = require("../models/product");
const { processedFiles } = require("../helpers");

const { RequestError } = require("../helpers");

const addProductController = async (req, res) => {
  const { _id: owner } = req.user;
  const {
    nameProduct,
    brendName,
    condition,
    section,
    vip,
    quantity,
    keyWords,
    size,
    category,
    mainFileName,
    description,
    price,
    date,
  } = req.body;
  const files = req.files;
  const filesUrls = await processedFiles(files, mainFileName);

  const newProduct = await Product.create({
    nameProduct: nameProduct,
    brendName: brendName,
    condition: condition,
    category: category,
    section: section,
    vip: vip,
    quantity: quantity,
    keyWords: keyWords,
    size: JSON.parse(size),
    date: date,
    description: description,
    price: price,
    owner: owner,
    mainPhotoUrl: filesUrls.mainFileURL,
    additionalPhotoUrl: filesUrls.additionalFilesURL,
    userLikes: [],
  });

  const updatedUser = await User.findOneAndUpdate(
    { _id: owner },
    { $push: { userProducts: newProduct._id } },
    { new: true }
  );

  res.status(200).json({ message: "Product added successfully" });
};

const deleteProductController = async (req, res) => {
  const { userId } = req.params;
  await User.findOneAndDelete({ _id: userId });
  const currentSession = req.session;
  await Session.deleteOne({ _id: currentSession._id });
  res.status(200).json({ message: "user deleted" });
};

const getProductsController = async (req, res) => {
  const products = await Product.find();
  res.status(200).json(products);
};

module.exports = {
  addProductController,
  deleteProductController,
  getProductsController,
};
