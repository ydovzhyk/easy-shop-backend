const { User } = require("../models/user");
const { Order } = require("../models/order");

const { RequestError } = require("../helpers");

const addOrderController = async (req, res) => {
  const { _id: owner } = req.user;
    console.log("owner", owner);
    console.log("req.body", req.body);
  const {
    ownerName,
    sellerId,
    products,
    totalSum,
    } = req.body;
    
  const newOrder = await Order.create({
    sellerName: ownerName,
    sellerId: sellerId,
    products: products,
    orderSum: totalSum,
  });
  console.log("newOrder", newOrder);

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

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        sellerName: sellerName ? sellerName : order.sellerName,
        delivery: delivery ? delivery : order.delivery,
        totalSum: totalSum ? totalSum : order.totalSum,
        products: products ? products : order.products,
        client: {
          customerId: customerId ? customerId : order.customerId,
          customerFirstName: customerFirstName
            ? customerFirstName
            : order.customerFirstName,
          customerSurName: customerSurName
            ? customerSurName
            : order.customerSurName,
          customerSecondName: customerSecondName
            ? customerSecondName
            : order.customerSecondName,
          customerTel: customerTel ? customerTel : order.customerTel,
        },
      },
      { new: true }
    );  

  res.status(200).json(updatedOrder);
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
  addOrderController,
  updateOrderController,
  getOrderByIdController,
};
