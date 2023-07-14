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
  "/",
  authorize,
//   validateBody(schemas.addPreOrderSchema),
  ctrlWrapper(ctrl.addPreOrderController)
);

// updateOrder
router.post(
  "/:orderId",
    authorize,
//   validateBody(schemas.updateOrderSchema),
  ctrlWrapper(ctrl.updateOrderController)
);


router.get("/:orderId", ctrlWrapper(ctrl.getOrderByIdController));

module.exports = router;
