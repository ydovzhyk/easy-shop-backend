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

// deleteProduct
// router.post(
//   "/delete",
//   authorize,
//   validateBody(schemas.deleteProductSchema),
//   ctrlWrapper(ctrl.deleteProductController)
// );

module.exports = router;
