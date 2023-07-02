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
    additionalPhotoUrl: filesUrls.additionalFilesURLs,
    userLikes: [],
  });

  const updatedUser = await User.findOneAndUpdate(
    { _id: owner },
    { $push: { userProducts: newProduct._id } },
    { new: true }
  );

  res.status(200).json({ message: "Product added successfully" });
};

const updateProductController = async (req, res) => {
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
    sale,
    saleDate,
    id,
    mainPhotoUrl,
    additionalPhotoUrl,
  } = req.body;

  const files = req.files;

  const product = await Product.findById(id);

  product.nameProduct = nameProduct;
  product.brendName = brendName;
  product.condition = condition;
  product.section = section;
  product.vip = vip;
  product.quantity = quantity;
  product.keyWords = keyWords;
  product.size = JSON.parse(size);
  product.category = category;
  product.description = description;
  product.price = price;
  product.sale = sale;
  product.saleDate = saleDate;

  let mainUrl = null;
  let additionalUrl = [];

  if (files.length === 0) {
    mainUrl = mainPhotoUrl;
    additionalUrl = JSON.parse(additionalPhotoUrl);
  } else if (mainFileName && files.length === 1) {
    const filesUrls = await processedFiles(files, mainFileName);
    mainUrl = filesUrls.mainFileURL;
    additionalUrl = JSON.parse(additionalPhotoUrl);
  } else if (!mainFileName && files.length > 0) {
    const filesUrls = await processedFiles(files, mainFileName);
    mainUrl = mainPhotoUrl;
    additionalUrl = filesUrls.additionalFilesURLs;
  } else {
    const filesUrls = await processedFiles(files, mainFileName);
    mainUrl = filesUrls.mainFileURL;
    additionalUrl = filesUrls.additionalFilesURLs;
  }

  product.mainPhotoUrl = mainUrl;
  product.additionalPhotoUrl = additionalUrl;

  await product.save();

  res.status(200).json({ message: "Product updated successfully" });
};

const deleteProductController = async (req, res) => {
  const { productId } = req.params;
  const { _id: owner } = req.user;
  try {
    await Product.deleteOne({ _id: productId });

    const updatedUser = await User.findOneAndUpdate(
      { _id: owner },
      { $pull: { userProducts: productId } },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
  res.status(200).json({ message: "Product deleted" });
};

const getProductsController = async (req, res) => {
  const products = await Product.find();
  res.status(200).json(products);
};

// get User products
const getUserProductsController = async (req, res) => {
  const { _id: userId } = req.user;
  const page = req.query.page || 1;
  const limit = 5;

  const count = await Product.countDocuments({ owner: userId });

  const totalPages = Math.ceil(count / limit);
  const skip = (page - 1) * limit;

  const products = await Product.find({ owner: userId })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    products,
    totalPages,
    totalUserPoducts: count,
  });
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
  if (uniqueProducts.length === 0) {
    res.status(200).json([]);
  } else {
    res.status(200).json(uniqueProducts);
  }
};

//get Product by Vip
const getVipProductsController = async (req, res) => {
  const page = req.query.page || 1; // Поточна сторінка
  const limit = 5; // Кількість карточок на сторінку

  const count = await Product.countDocuments({ vip: "Так" }); // Кількість всіх продуктів, що відповідають критерію

  const totalPages = Math.ceil(count / limit); // Загальна кількість сторінок
  const skip = (page - 1) * limit; // Кількість продуктів, які потрібно пропустити

  const products = await Product.find({ vip: "Так" }).skip(skip).limit(limit);

  res.status(200).json({
    products,
    totalPages, // Додано загальну кількість сторінок у відповідь
  });
};

//get Product by Selector
const getSelectorProductsController = async (req, res) => {
  const page = req.query.page || 1;
  const selector = req.query.selectorName || "New";
  const limit = 10;
  const count = await Product.countDocuments();
  const totalPages = Math.ceil(count / limit);
  const skip = (page - 1) * limit;

  if (selector === "new") {
    const products = await Product.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      products,
      totalPages,
    });
  }
  if (selector === "advice") {
    const averagePrice = await Product.aggregate([
      { $group: { _id: null, avgPrice: { $avg: "$price" } } },
    ]);
    const average = averagePrice[0].avgPrice;
    const lowerBound = average - average * 0.4;
    const upperBound = average + average * 0.4;

    const adviceCount = await Product.countDocuments({
      price: { $gte: lowerBound, $lte: upperBound },
    });
    const adviceTotalPages = Math.ceil(adviceCount / limit);

    const products = await Product.find({
      price: { $gte: lowerBound, $lte: upperBound },
    })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      products,
      totalPages: adviceTotalPages,
    });
  }
  if (selector === "sale") {
    const products = await Product.find().skip(skip).limit(limit);

    res.status(200).json({
      products,
      totalPages,
    });
  }
};

//get Product by ID
const getProductByIdController = async (req, res, next) => {
  const { productId } = req.params;
  const productById = await Product.findById(productId);
  if (!productById) {
    return next(RequestError(404, "Not found"));
  }
  return res.status(200).json(productById);
};

//get Product from Basket
const getProductFromBasketController = async (req, res, next) => {
  const { ownerId } = req.params;
  try {
    const user = await User.findById(ownerId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const productIds = user.userBasket;
    const products = await Product.find({ _id: { $in: productIds } });

    const uniqueOwners = [...new Set(products.map((product) => product.owner))];

    const sellers = await User.find({ _id: { $in: uniqueOwners } });

    return res
      .status(200)
      .json({ productsFromBasket: products, sellersFromBasket: sellers });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addProductController,
  updateProductController,
  deleteProductController,
  getProductsController,
  getUserProductsController,
  getProductsQueryController,
  getVipProductsController,
  getSelectorProductsController,
  getProductByIdController,
  getProductFromBasketController,
};
