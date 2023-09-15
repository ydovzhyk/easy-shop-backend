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
  // validateBody(schemas.addProductSchema),
  ctrlWrapper(ctrl.addProductController)
);

// update Product
router.post(
  "/update",
  upload.array("files"),
  authorize,
  // validateBody(schemas.updateProductSchema),
  ctrlWrapper(ctrl.updateProductController)
);

// get all Products
router.get("/", ctrlWrapper(ctrl.getProductsController));

//get products by Query
router.get(
  "/search",
  validateBody(schemas.getProductsQuerySchema),
  ctrlWrapper(ctrl.getProductsQueryController)
);

// get user products
router.get(
  "/user-products",
  authorize,
  validateBody(schemas.getUserProductsSchema),
  ctrlWrapper(ctrl.getUserProductsController)
);

// get vip products
router.get("/vip", ctrlWrapper(ctrl.getVipProductsController));

// get products by selector
router.get(
  "/selector",
  validateBody(schemas.getSelectorProductsSchema),
  ctrlWrapper(ctrl.getSelectorProductsController)
);

// delete product by id
router.delete(
  "/delete/:productId",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.deleteProductController)
);

router.get(
  "/:productId",
  isValidId,
  ctrlWrapper(ctrl.getProductByIdController)
);

router.get(
  "/basket/:ownerId",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.getProductFromBasketController)
);

router.get(
  "/otheruser/:userId",
  // authorize,
  isValidId,
  ctrlWrapper(ctrl.getProductOtherUserController)
);

module.exports = router;
