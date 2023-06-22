const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/verifyController");

const { validateBody, isValidId, authorize } = require("../../middlewares");
const { schemas } = require("../../models/user");
const router = express.Router();

// verification
router.post(
  "/",
  authorize,
  validateBody(schemas.verificationSchema),
  ctrlWrapper(ctrl.verificationController)
);

router.get("/:verificationToken", ctrlWrapper(ctrl.verifyController));

module.exports = router;
