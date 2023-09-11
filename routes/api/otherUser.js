const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/otherUserController");

const { validateBody, isValidId, authorize } = require("../../middlewares");
const { schemas } = require("../../models/user");
const router = express.Router();

// Get Other User Info
router.post("/", isValidId, ctrlWrapper(ctrl.getOtherUserController));

//Get User Subscriptions
router.post(
  "/subscriptions",
  authorize,
  validateBody(schemas.userSubscriptionsSchema),
  ctrlWrapper(ctrl.userSubscriptionsController)
);

router.post(
  "/subscriptions/delete",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.userDeleteSubscriptionsController)
);

module.exports = router;
