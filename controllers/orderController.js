const { User } = require("../models/user");
const { Order } = require("../models/order");

const { RequestError } = require("../helpers");
const moment = require("moment");

const addOrderController = async (req, res) => {
  const { _id: owner } = req.user;
  const { ownerName, ownerId, products, totalSum } = req.body;
  const currentDate = moment().format("DD.MM.YYYY HH:mm");  
  
  const newOrder = await Order.create({
    sellerName: ownerName,
    sellerId: ownerId,
    products: products,
    orderSum: totalSum,
    client: {
      customerId: owner,
    },
    orderDate: currentDate,
  });

  const updatedUser = await User.findOneAndUpdate(
    { _id: owner },
    { $push: { userOrders: newOrder._id } },
    { new: true }
  );

  res.status(200).json({
    message: "Order added successfully",
    newOrderId: newOrder._id,
    newOrder,
  });
};

const updateOrderController = async (req, res) => {
    // const { orderId } = req.params;
  const {
    orderId,
    sellerName,
    sellerId,
    products,
    totalSum,
    customerId,
    customerFirstName,
    customerSurName,
    customerSecondName,
    delivery,
    customerTel,
    orderNumber,
  } = req.body;
    // console.log("req.body", req.body);
    const order = await Order.findById(orderId);

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        sellerName: sellerName ? sellerName : order.sellerName,
        sellerId: sellerId ? sellerId : order.sellerId,
        products: products ? products : order.products,
        orderSum: totalSum ? totalSum : order.orderSum,
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
        orderNumber: orderNumber ? orderNumber : order.orderNumber,
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
  return res.status(200).json(orderById);
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
  const limit = 5;
  
  const count = await Order.countDocuments({ "client.customerId": userId });
  const totalPages = Math.ceil(count / limit);
  const skip = (page - 1) * limit;

  const userOrders = await Order.find({ "client.customerId": userId })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    orders: userOrders,
    totalPages,
    totalUserOrders: count,
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
