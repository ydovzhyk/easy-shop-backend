const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/productController");

const {
  validateBody,
  isValidId,
  authorize,
  upload,
} = require("../../middlewares");

const { schemas } = require("../../models/product");

const router = express.Router();
// addProduct
router.post(
  "/add",
  upload.array("files"),
  authorize,
  ctrlWrapper(ctrl.addProductController)
);

// addProduct
router.post(
  "/update",
  upload.array("files"),
  authorize,
  ctrlWrapper(ctrl.updateProductController)
);

router.get("/", ctrlWrapper(ctrl.getProductsController));

//get products by Query
router.get("/search", ctrlWrapper(ctrl.getProductsQueryController));

// get user products
router.get(
  "/user-products",
  authorize,
  ctrlWrapper(ctrl.getUserProductsController)
);

// get vip products
router.get("/vip", ctrlWrapper(ctrl.getVipProductsController));

// get products by selector
router.get("/selector", ctrlWrapper(ctrl.getSelectorProductsController));

// delete product by id
router.delete(
  "/delete/:productId",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.deleteProductController)
);

router.get("/:productId", ctrlWrapper(ctrl.getProductByIdController));

router.get(
  "/basket/:ownerId",
  ctrlWrapper(ctrl.getProductFromBasketController)
);

module.exports = router;
