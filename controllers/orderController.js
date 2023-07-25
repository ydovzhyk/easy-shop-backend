const { User } = require("../models/user");
const { Order } = require("../models/order");
const { Product } = require("../models/product");
const { RequestError } = require("../helpers");
const moment = require("moment");

const addOrderController = async (req, res) => {
  const { _id: owner, email, firstName, secondName, surName, tel } = req.user;
  console.log(owner, email, firstName, secondName, surName, tel);
  const { ownerName, ownerId, products, totalSum } = req.body;
  const currentDate = moment().format("DD.MM.YYYY HH:mm");  
  
  const newOrder = await Order.create({
    sellerName: ownerName,
    sellerId: ownerId,
    products: products,
    orderSum: totalSum,
    client: {
      customerId: owner,
      customerSecondName: secondName ? secondName : "",
      customerFirstName: firstName ? firstName : "",
      customerSurName: surName ? surName : "",
      customerTel: tel ? tel : "",
    },
    orderDate: currentDate,
  });
console.log("newOrder", newOrder);
  const updatedUser = await User.findOneAndUpdate(
    { _id: owner },
    { $push: { userOrders: newOrder._id } },
    { new: true }
  );
  console.log("updatedUser", updatedUser);
  console.log("newOrder._id", newOrder._id.toString());
  const orderNumberFromId =   newOrder._id.toString().match(/\d+/g).join("").slice(0, 7);
  console.log("orderNumberFromId", orderNumberFromId);

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: newOrder._id },
    {
      orderNumber: orderNumberFromId ? orderNumberFromId : "",
    },
    { new: true }
  );
  console.log("updatedOrder", updatedOrder);
  console.log("newOrder.products", newOrder.products);
  const productInOrderArray = [];
  for (const newOrderProduct of newOrder.products) {
    const productId = newOrderProduct._id;
    console.log("productId", productId);
    const product = await Product.findById(productId);

    productInOrderArray.push(product);
  }
  console.log("productInOrderArray", productInOrderArray);
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
    // sellerName,
    // sellerId,
    // products,
    // totalSum,
    customerId,
    customerFirstName,
    customerSurName,
    customerSecondName,
    delivery,
    customerTel,
    // orderNumber,
  } = req.body;
    // console.log("req.body", req.body);
    const order = await Order.findById(orderId);

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        // sellerName: sellerName ? sellerName : order.sellerName,
        // sellerId: sellerId ? sellerId : order.sellerId,
        // products: products ? products : order.products,
        // orderSum: totalSum ? totalSum : order.orderSum,
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
        // orderNumber: orderNumber ? orderNumber : order.orderNumber,
      },
      { new: true }
    );  
// console.log("updatedOrder", updatedOrder);
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
  // const orderById = await Order.findById(orderId);
  // const ownerId = orderById.client.customerId;
  const { _id: owner } = req.user;
  try {
    await Order.deleteOne({ _id: orderId });

    const updatedUser = await User.findOneAndUpdate(
      { _id: owner },
      // { _id: ownerId },
      { $pull: { userOrders: orderId } },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
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
  const limit = 10;
  
  const count = await Order.countDocuments({ "client.customerId": userId });
  const totalPages = Math.ceil(count / limit);
  const skip = (page - 1) * limit;

  const userOrders = await Order.find({ "client.customerId": userId })
    .skip(skip)
    .limit(limit);
  
  const updatedOrdersArray = [];
  for (const order of userOrders) {
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

  res.status(200).json({
    orders: updatedOrdersArray,
    totalPages,
    totalUserOrders: count,
    // ordersProductsInfo: updatedOrdersArray,
  });
};

module.exports = {
  addOrderController,
  updateOrderController,
  getOrderByIdController,
  getOrdersController,
  deleteOrderController,
  getUserOrdersController,
};
