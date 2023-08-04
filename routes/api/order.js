const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/orderController");

const {
  validateBody,
  authorize,
} = require("../../middlewares");

const { schemas } = require("../../models/order");

const router = express.Router();

// addOrder
router.post(
  "/add",
  authorize,
  validateBody(schemas.addOrderSchema),
  ctrlWrapper(ctrl.addOrderController)
);

// updateOrder
router.post(
  "/update",
  authorize,
  validateBody(schemas.updateOrderSchema),
  ctrlWrapper(ctrl.updateOrderController)
);

router.get("/", ctrlWrapper(ctrl.getOrdersController));
router.get("/:orderId", ctrlWrapper(ctrl.getOrderByIdController));

// delete order by id
router.delete(
  "/delete/:orderId",
  authorize,
  ctrlWrapper(ctrl.deleteOrderController)
);

// get user orders
router.post(
  "/user-orders",
  authorize,
  ctrlWrapper(ctrl.getUserOrdersController)
);

// get user sales
router.post("/user-sales", authorize, ctrlWrapper(ctrl.getUserSalesController));
// updateOrder status
router.post(
  "/confirmation",
  authorize,
  ctrlWrapper(ctrl.updateOrderStatusController)
);

module.exports = router;
