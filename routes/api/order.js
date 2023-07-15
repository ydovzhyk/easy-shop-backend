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

module.exports = router;
