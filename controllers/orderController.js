const { User } = require("../models/user");
const { Order } = require("../models/order");
const { Product } = require("../models/product");
const { RequestError } = require("../helpers");
const moment = require("moment");

const addOrderController = async (req, res) => {
  const { _id: clientId, firstName, secondName, surName, tel } = req.user;
  const { ownerName, ownerId, products, totalSum } = req.body;
  const currentDate = moment().format("DD.MM.YYYY HH:mm");  
  
  const newOrder = await Order.create({
    sellerName: ownerName,
    sellerId: ownerId,
    products: products,
    orderSum: totalSum,
    client: {
      customerId: clientId,
      customerSecondName: secondName ? secondName : "",
      customerFirstName: firstName ? firstName : "",
      customerSurName: surName ? surName : "",
      customerTel: tel ? tel : "",
    },
    orderDate: currentDate,
  });
  const updatedUser = await User.findOneAndUpdate(
    { _id: clientId },
    { $push: { userOrders: newOrder._id } },
    { new: true }
  );

  const orderNumberFromId =   newOrder._id.toString().match(/\d+/g).join("").slice(0, 8);

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: newOrder._id },
    {
      orderNumber: orderNumberFromId ? orderNumberFromId : "",
    },
    { new: true }
  );

  const productInOrderArray = [];
  for (const newOrderProduct of newOrder.products) {
    const productId = newOrderProduct._id;
    const product = await Product.findById(productId);

    productInOrderArray.push(product);
  }
  const updatedNewOrder = {
    order: updatedOrder,
    orderProductInfo: productInOrderArray,
  };

  res.status(200).json({
    message: "Order added successfully",
    newOrderId: newOrder._id,
    newOrder: updatedNewOrder,
  });
};

const updateOrderController = async (req, res) => {
    // const { orderId } = req.params;
  const {
    orderId,
    customerId,
    customerFirstName,
    customerSurName,
    customerSecondName,
    delivery,
    customerTel,
  } = req.body;
    // console.log("req.body", req.body);
    const order = await Order.findById(orderId);

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        client: {
          customerId: customerId ? customerId : order.customerId,
          customerSecondName: customerSecondName
            ? customerSecondName
            : order.customerSecondName,
          customerFirstName: customerFirstName
            ? customerFirstName
            : order.customerFirstName,
          customerSurName: customerSurName
            ? customerSurName
            : order.customerSurName,
          customerTel: customerTel ? customerTel : order.customerTel,
        },
        delivery: delivery ? delivery : order.delivery,
      },
      { new: true }
    );  
// console.log("updatedOrder", updatedOrder);
// console.log("order.sellerId ", order.sellerId);
  const updatedSeller = await User.findOneAndUpdate(
    { _id: order.sellerId },
    { $push: { userSales: orderId } },
    { new: true }
  );
  res.status(200).json({
    message: "Order formed successfully",
    updatedOrder,
    code: 200,
  });
};

//get Order by ID
const getOrderByIdController = async (req, res, next) => {
  const { orderId } = req.params;
  const orderById = await Order.findById(orderId);
  if (!orderById) {
    return next(RequestError(404, "Not found"));
  }
  const productInOrderArray = [];
  for (const orderProduct of orderById.products) {
    const productId = orderProduct._id;
    const product = await Product.findById(productId);

    productInOrderArray.push(product);
  }
  const updatedOrderById = {
    order: orderById,
    orderProductInfo: productInOrderArray,
  };
  return res.status(200).json(updatedOrderById);
};

const getOrdersController = async (req, res) => {
  const orders = await Order.find();
  res.status(200).json(orders);
};

const deleteOrderController = async (req, res) => {
  const { orderId } = req.params;
  const orderById = await Order.findById(orderId);
  // const ownerId = orderById.client.customerId;
  const sellerId = orderById.sellerId;
  const { _id: owner } = req.user;
  try {
    await Order.deleteOne({ _id: orderId });

    const updatedClient = await User.findOneAndUpdate(
      { _id: owner },
      // { _id: ownerId },
      { $pull: { userOrders: orderId } },
      { new: true }
    );

    if (!updatedClient) {
      throw new Error("Client not found");
    }

    const updatedSeller = await User.findOneAndUpdate(
      { _id: sellerId },
      { $pull: { userOrders: orderId } },
      { new: true }
    );

    if (!updatedSeller) {
      throw new Error("Seller not found");
    }

    res.status(200).json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Order" });
  }
  res.status(200).json({ message: "Order deleted" });
};

// get User orders
const getUserOrdersController = async (req, res) => {
  const { _id: userId } = req.user;
  // console.log(userId);
  const page = req.query.page || 1;
  const limit = 8;
  const skip = (page - 1) * limit;

  const selector = req.query.selectorName || "all";
  
  let selectedOrders;
  let count;
  
  if (selector === "all") {
    count = await Order.countDocuments({ "client.customerId": userId });
    selectedOrders = await Order.find({ "client.customerId": userId })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);
  }
  if (selector === "new") {
    count = await Order.countDocuments({
      "client.customerId": userId,
      confirmed: false,
      new: true,
    });
    selectedOrders = await Order.find({
      "client.customerId": userId,
      confirmed: false,
      new: true,
    })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);
  }
  if (selector === "confirmed") {
    count = await Order.countDocuments({
      "client.customerId": userId,
      confirmed: true,
      new: false,
    });
    selectedOrders = await Order.find({
      "client.customerId": userId,
      confirmed: true,
      new: false,
    })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);
  }
  if (selector === "canceled") {
    count = await Order.countDocuments({
      "client.customerId": userId,
      confirmed: false,
      new: false,
    });
    selectedOrders = await Order.find({
      "client.customerId": userId,
      confirmed: false,
      new: false,
    })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);
  }

  const updatedOrdersArray = [];
  for (const order of selectedOrders) {
    const orderProducts = order.products;

    const productInfoArray = [];
    for (const product of orderProducts) {
      const productId = product._id;
      const productInfo = await Product.findById(productId);
      productInfoArray.push(productInfo);
    }

    const updatedOrder = {
      ...order._doc,
      productInfo: productInfoArray,
    };
    updatedOrdersArray.push(updatedOrder);
  }

  const totalPages = Math.ceil(count / limit);

  res.status(200).json({
    orders: updatedOrdersArray,
    totalPages,
    totalUserOrders: count,
  });
};

// get User orders
const getUserSalesController = async (req, res) => {
  const { _id: userId } = req.user;
  // console.log(userId);
  const page = req.query.page || 1;
  const limit = 8;
  const skip = (page - 1) * limit;

  const selector = req.query.selectorName || "all";

  let selectedSales;
  let count;

  if (selector === "all") {
    count = await Order.countDocuments({ sellerId: userId });
    selectedSales = await Order.find({ sellerId: userId })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);
  }

  if (selector === "new") { 
    count = await Order.countDocuments({
      sellerId: userId,
      confirmed: false,
      new: true,
    });
    selectedSales = await Order.find({
      sellerId: userId,
      confirmed: false,
      new: true,
    })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);
  }
  
  if (selector === "confirmed") {
    count = await Order.countDocuments({
      sellerId: userId,
      confirmed: true,
      new: false,
    });
    selectedSales = await Order.find({
      sellerId: userId,
      confirmed: true,
      new: false,
    })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);
  }

  if (selector === "canceled") {
    count = await Order.countDocuments({
      sellerId: userId,
      confirmed: false,
      new: false,
    });
    selectedSales = await Order.find({
      sellerId: userId,
      confirmed: false,
      new: false,
    })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);
  }

  const updatedOrdersArray = [];
  for (const order of selectedSales) {
    const orderProducts = order.products;

    const productInfoArray = [];
    for (const product of orderProducts) {
      const productId = product._id;
      const productInfo = await Product.findById(productId);
      productInfoArray.push(productInfo);
    }

    const updatedOrder = {
      ...order._doc,
      productInfo: productInfoArray,
    };
    updatedOrdersArray.push(updatedOrder);
  }

  const totalPages = Math.ceil(count / limit);

  res.status(200).json({
    sales: updatedOrdersArray,
    totalPages,
    totalUserSales: count,
  });
};

module.exports = {
  addOrderController,
  updateOrderController,
  getOrderByIdController,
  getOrdersController,
  deleteOrderController,
  getUserOrdersController,
  getUserSalesController,
};
