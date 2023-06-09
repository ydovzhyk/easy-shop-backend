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

const getUserProductsController = async (req, res) => {
  const { _id: userId } = req.body;
  const products = await Product.find({ owner: userId });
  res.status(200).json(products);
};

// get products by Query
const getProductsQueryController = async (req, res) => {
  const { search } = req.query;

  const searchKeywords = search.toLowerCase().split(" ");

  const regexQueries = searchKeywords.map((keyword) => ({
    $or: [
      { nameProduct: { $regex: keyword, $options: "i" } },
      { brendName: { $regex: keyword, $options: "i" } },
      { condition: { $regex: keyword, $options: "i" } },
      { section: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { keyWords: { $regex: keyword, $options: "i" } },
    ],
  }));

  const filteredProducts = await Product.find({ $and: regexQueries }).lean();

  const uniqueProducts = filteredProducts.reduce((unique, product) => {
    if (!unique.find((item) => item._id === product._id)) {
      unique.push(product);
    }
    return unique;
  }, []);
  console.log(uniqueProducts);
  if (uniqueProducts.length === 0) {
    res.status(200).json([]);
  } else {
    res.status(200).json(uniqueProducts);
  }
};

module.exports = {
  addProductController,
  deleteProductController,
  getProductsController,
  getUserProductsController,
  getProductsQueryController,
};
