const { User } = require("../models/user");
const { Order } = require("../models/order");
const { Product } = require("../models/product");
const { RequestError } = require("../helpers");
const moment = require("moment-timezone");

//add order
const addOrderController = async (req, res, next) => {
  try {
    const { _id: clientId, firstName, secondName, surName, tel } = req.user;
    const { ownerName, ownerId, products, totalSum } = req.body;
    const currentDate = moment().tz("Europe/Kiev").format("DD.MM.YYYY HH:mm");

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

    const orderNumberFromId = newOrder._id
      .toString()
      .match(/\d+/g)
      .join("")
      .slice(0, 8);

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
  } catch (error) {
    next(error);
  }
};

//update Order
const updateOrderController = async (req, res, next) => {
  try {
    const {
      orderId,
      customerId,
      customerFirstName,
      customerSurName,
      customerSecondName,
      delivery,
      customerTel,
    } = req.body;

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

    await User.findOneAndUpdate(
      { _id: order.sellerId },
      { $push: { userSales: orderId } },
      { new: true }
    );

    res.status(200).json({
      message: "Order formed successfully",
      updatedOrder,
      code: 200,
    });
  } catch (error) {
    next(error);
  }
};

//get Order by ID
const getOrderByIdController = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

//get all Orders
const getOrdersController = async (req, res) => {
  const orders = await Order.find();
  res.status(200).json(orders);
};

//delete Order
const deleteOrderController = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const orderById = await Order.findById(orderId);
    const ownerId = orderById.client.customerId;
    const sellerId = orderById.sellerId;
    try {
      await Order.deleteOne({ _id: orderId });

      const updatedClient = await User.findOneAndUpdate(
        { _id: ownerId },
        { $pull: { userOrders: orderId } },
        { new: true }
      );

      if (!updatedClient) {
        throw new Error("Client not found");
      }

      const updatedSeller = await User.findOneAndUpdate(
        { _id: sellerId },
        { $pull: { userSales: orderId } },
        { new: true }
      );

      if (!updatedSeller) {
        throw new Error("Seller not found");
      }

      res.status(200).json({ message: "Order deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting Order" });
    }
  } catch (error) {
    next(error);
  }
};

// get User orders
const getUserOrdersController = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;

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
        statusNew: true,
      });
      selectedOrders = await Order.find({
        "client.customerId": userId,
        confirmed: false,
        statusNew: true,
      })
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit);
    }
    if (selector === "confirmed") {
      count = await Order.countDocuments({
        "client.customerId": userId,
        confirmed: true,
        statusNew: false,
      });
      selectedOrders = await Order.find({
        "client.customerId": userId,
        confirmed: true,
        statusNew: false,
      })
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit);
    }
    if (selector === "canceled") {
      count = await Order.countDocuments({
        "client.customerId": userId,
        confirmed: false,
        statusNew: false,
      });
      selectedOrders = await Order.find({
        "client.customerId": userId,
        confirmed: false,
        statusNew: false,
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
  } catch (error) {
    next(error);
  }
};

// get User orders
const getUserSalesController = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;

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
        statusNew: true,
      });
      selectedSales = await Order.find({
        sellerId: userId,
        confirmed: false,
        statusNew: true,
      })
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit);
    }

    if (selector === "confirmed") {
      count = await Order.countDocuments({
        sellerId: userId,
        confirmed: true,
        statusNew: false,
      });
      selectedSales = await Order.find({
        sellerId: userId,
        confirmed: true,
        statusNew: false,
      })
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit);
    }

    if (selector === "canceled") {
      count = await Order.countDocuments({
        sellerId: userId,
        confirmed: false,
        statusNew: false,
      });
      selectedSales = await Order.find({
        sellerId: userId,
        confirmed: false,
        statusNew: false,
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
  } catch (error) {
    next(error);
  }
};

const updateOrderStatusController = async (req, res, next) => {
  try {
    const { orderId, confirmed, statusNew } = req.body;

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        confirmed: confirmed,
        statusNew: statusNew,
      },
      { new: true }
    );

    const seller = updatedOrder.sellerId;

    await User.findOneAndUpdate(
      { _id: seller },
      { $inc: { successfulSales: 1 } }
    );

    res.status(200).json({
      message: "Order changed successfully",
      updatedOrder,
      code: 200,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrderController,
  updateOrderController,
  getOrderByIdController,
  getOrdersController,
  deleteOrderController,
  getUserOrdersController,
  getUserSalesController,
  updateOrderStatusController,
};
