const { User } = require("../models/user");
const { Product } = require("../models/product");

const { processedFiles, createLink } = require("../helpers");
const { RequestError } = require("../helpers");

//add Product
const addProductController = async (req, res, next) => {
  try {
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

    // const filesUrls = await processedFiles(files, mainFileName);
    const filesUrls = await createLink(files, mainFileName);

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

    await User.findOneAndUpdate(
      { _id: owner },
      { $push: { userProducts: newProduct._id } },
      { new: true }
    );

    res.status(200).json({ message: "Product added successfully" });
  } catch (error) {
    next(error);
  }
};

//update Product data
const updateProductController = async (req, res, next) => {
  try {
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
      // const filesUrls = await processedFiles(files, mainFileName);
      const filesUrls = await createLink(files, mainFileName);
      mainUrl = filesUrls.mainFileURL;
      additionalUrl = JSON.parse(additionalPhotoUrl);
    } else if (!mainFileName && files.length > 0) {
      // const filesUrls = await processedFiles(files, mainFileName);
      const filesUrls = await createLink(files, mainFileName);
      mainUrl = mainPhotoUrl;
      additionalUrl = filesUrls.additionalFilesURLs;
    } else {
      // const filesUrls = await processedFiles(files, mainFileName);
      const filesUrls = await createLink(files, mainFileName);
      mainUrl = filesUrls.mainFileURL;
      additionalUrl = filesUrls.additionalFilesURLs;
    }

    product.mainPhotoUrl = mainUrl;
    product.additionalPhotoUrl = additionalUrl;

    await product.save();

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    next(error);
  }
};

//delete Product
const deleteProductController = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

//get all Product
const getProductsController = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

//get User products
const getUserProductsController = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const page = Number(req.query.page) || 1;
    const limit = 5;

    const count = await Product.countDocuments({ owner: userId });

    const totalPages = Math.ceil(count / limit);
    const skip = (page - 1) * limit;

    const products = await Product.find({ owner: userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      products,
      totalPages,
      totalUserPoducts: count,
    });
  } catch (error) {
    next(error);
  }
};

//get products by Query
const getProductsQueryController = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const searchQuery = req.query.searchQuery;
    const section = req.query.section;
    const category = req.query.category;
    const filterData = JSON.parse(req.query.filterData);
    const limit = 6;

    const searchKeywords = searchQuery.toLowerCase().split(" ");

    const getRegexQueries = (searchKeywords) => {
      return searchKeywords.map((keyword) => ({
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
    };

    const categoryQuery = {};
    if (section) {
      categoryQuery.section = section;
    }
    if (category) {
      categoryQuery.category = category;
    }

    const regexQueries = getRegexQueries(searchKeywords);
    const query =
      Object.keys(categoryQuery).length > 0
        ? { $and: [categoryQuery, ...regexQueries] }
        : { $or: regexQueries };

    const filteredProducts = await Product.find(query).lean();

    let uniqueProducts = filteredProducts.reduce((unique, product) => {
      if (!unique.find((item) => item._id === product._id)) {
        unique.push(product);
      }
      return unique;
    }, []);

    if (filterData.brandName) {
      const lowercaseBrandName = String(filterData.brandName).toLowerCase();
      uniqueProducts = uniqueProducts.filter((product) => {
        return product.brendName.toLowerCase().includes(lowercaseBrandName);
      });
    }

    if (filterData.size && JSON.parse(filterData.size).length > 0) {
      const sizes = JSON.parse(filterData.size);
      uniqueProducts = uniqueProducts.filter((product) => {
        for (const sizeData of sizes) {
          const sizeName = sizeData[0].name;
          if (
            product.size.some((item) => {
              return item[0].name === sizeName;
            })
          ) {
            return true;
          }
        }
        return false;
      });
    }

    if (filterData.condition && filterData.condition.length > 0) {
      const conditions = filterData.condition.map((condition) =>
        String(condition).toLowerCase()
      );
      uniqueProducts = uniqueProducts.filter((product) => {
        return conditions.some((condition) => {
          return product.condition.toLowerCase() === condition;
        });
      });
    }

    if (filterData.filterPriceFrom && filterData.filterPriceTo) {
      const filterPriceFrom = parseInt(filterData.filterPriceFrom);
      const filterPriceTo = parseInt(filterData.filterPriceTo);

      uniqueProducts = uniqueProducts.filter((product) => {
        const productPrice = parseInt(product.price);
        return productPrice >= filterPriceFrom && productPrice <= filterPriceTo;
      });
    }

    if (filterData.filterPrice) {
      const filterPrice = String(filterData.filterPrice);

      if (filterPrice === "До 100грн") {
        uniqueProducts = uniqueProducts.filter((product) => {
          const productPrice = parseInt(product.price);
          return productPrice <= 100;
        });
      } else if (filterPrice === "Більше 1000грн") {
        uniqueProducts = uniqueProducts.filter((product) => {
          const productPrice = parseInt(product.price);
          return productPrice > 1000;
        });
      } else if (filterPrice.includes("Від") && filterPrice.includes("до")) {
        const priceRange = filterPrice
          .replace("Від", "")
          .replace("до", "")
          .split(" ");

        const filterPriceFrom = parseInt(priceRange[1]);
        const filterPriceTo = parseInt(priceRange[3]);

        uniqueProducts = uniqueProducts.filter((product) => {
          const productPrice = parseInt(product.price);
          return (
            productPrice >= filterPriceFrom && productPrice <= filterPriceTo
          );
        });
      }
    }

    const count = uniqueProducts.length;
    const totalPages = Math.ceil(count / limit);
    const skip = (page - 1) * limit;

    const compareDates = (a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    };

    const sortedUniqueProducts = uniqueProducts.sort(compareDates);

    if (sortedUniqueProducts.length === 0) {
      res.status(200).json({ products: [], totalPages: 1, totalProducts: [] });
    } else {
      const paginatedProducts = sortedUniqueProducts.slice(skip, skip + limit);
      res.status(200).json({
        products: paginatedProducts,
        totalPages: totalPages,
        totalProducts: sortedUniqueProducts,
      });
    }
  } catch (error) {
    next(error);
  }
};

//get Product by Vip
const getVipProductsController = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 5;

    const count = await Product.countDocuments({ vip: "Так" });

    const totalPages = Math.ceil(count / limit);
    const skip = (page - 1) * limit;

    const products = await Product.find({ vip: "Так" })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      products,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

//get Product by Selector
const getSelectorProductsController = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const selector = req.query.selectorName || "new";
    const limit = 10;
    const skip = (page - 1) * limit;

    if (selector === "new") {
      const count = await Product.countDocuments();
      const products = await Product.find()
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(count / limit);

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
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        products,
        totalPages: adviceTotalPages,
      });
    }
    if (selector === "sale") {
      const count = await Product.countDocuments({
        sale: { $gt: 0 },
      });
      const products = await Product.find({
        sale: { $gt: 0 },
      })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        products,
        totalPages,
      });
    }
  } catch (error) {
    next(error);
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
  try {
    const { ownerId } = req.params;
    const user = await User.findById(ownerId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const productIds = user.userBasket.map((item) => {
      return item.productId;
    });

    const products = await Product.find({ _id: { $in: productIds } });
    const uniqueOwners = [...new Set(products.map((product) => product.owner))];
    const sellers = await User.find({ _id: { $in: uniqueOwners } });

    return res
      .status(200)
      .json({ productsFromBasket: products, sellersFromBasket: sellers });
  } catch (error) {
    next(error);
  }
};

//get Products from OtherUser
const getProductOtherUserController = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const products = await Product.find({ owner: userId });

    if (products.length === 0) {
      return res.status(200).json({
        productsFromOtherUser: [],
      });
    } else {
      return res.status(200).json({
        productsFromOtherUser: products,
      });
    }
  } catch (error) {
    next(error);
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
  getProductOtherUserController,
};
