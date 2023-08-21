const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/otherUserController");

const { validateBody, isValidId, authorize } = require("../../middlewares");

const router = express.Router();

// Get Other User Info
router.post("/", ctrlWrapper(ctrl.getOtherUserController));

router.post(
  "/subscriptions",
  authorize,
  ctrlWrapper(ctrl.userSubscriptionsController)
);

router.post(
  "/subscriptions/delete",
  authorize,
  ctrlWrapper(ctrl.userDeleteSubscriptionsController)
);

module.exports = router;
