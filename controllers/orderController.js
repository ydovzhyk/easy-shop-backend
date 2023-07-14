const { User } = require("../models/user");
const { Order } = require("../models/order");

const { RequestError } = require("../helpers");

const addPreOrderController = async (req, res) => {
  const { _id: owner } = req.user;
  const {
    ownerName,
    products,
    totalSum,
    } = req.body;
    
  const newOrder = await Order.create({
    sellerName: ownerName,
    sellerId: owner,
    products: products,
    orderSum: totalSum,
  });

  const updatedUser = await User.findOneAndUpdate(
    { _id: owner },
    { $push: { orders: newOrder._id } },
    { new: true }
  );

  res.status(200).json( newOrder._id );
};

const updateOrderController = async (req, res) => {
    const { orderId } = req.params;
    const {
      sellerName,
      products,
      totalSum,
      customerId,
      customerFirstName,
      customerSurName,
      customerSecondName,
      delivery,
      customerTel,
    } = req.body;
    
  const order = await Order.findById(orderId);

  order.delivery = delivery;
    order.client = {
      customerId,
      customerFirstName,
      customerSurName,
      customerSecondName,
      customerTel,
    };
  order.products = products;
  order.sellerName = sellerName;
  order.totalSum = totalSum;

  await order.save();

  res.status(200).json({ message: "Order updated successfully" });
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

module.exports = {
  addPreOrderController,
  updateOrderController,
  getOrderByIdController,
};
