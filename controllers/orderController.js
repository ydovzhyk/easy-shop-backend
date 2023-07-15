const { User } = require("../models/user");
const { Order } = require("../models/order");

const { RequestError } = require("../helpers");

const addOrderController = async (req, res) => {
  const { _id: owner } = req.user;
  const { ownerName, ownerId, products, totalSum } = req.body;
    
  const newOrder = await Order.create({
    sellerName: ownerName,
    sellerId: ownerId,
    products: products,
    orderSum: totalSum,
    client: {
      customerId: owner,
    },
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
    } = req.body;
    console.log("req.body", req.body);
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
      },
      { new: true }
    );  
console.log("updatedOrder", updatedOrder);
  res.status(200).json({
    message: "Product updated successfully",
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

module.exports = {
  addOrderController,
  updateOrderController,
  getOrderByIdController,
  getOrdersController,
};
