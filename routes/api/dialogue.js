const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/dialogueController");

const { validateBody, isValidId, authorize } = require("../../middlewares");
const { schemas } = require("../../models/dialogue");
const router = express.Router();

router.post(
  "/create",
  authorize,
  validateBody(schemas.createDialogueSchema),
  ctrlWrapper(ctrl.createDialogueController)
);

router.post(
  "/get",
  authorize,
  validateBody(schemas.getDialogueSchema),
  ctrlWrapper(ctrl.getDialogueController)
);

router.post(
  "/getData",
  authorize,
  validateBody(schemas.getAllDialoguesSchema),
  ctrlWrapper(ctrl.getAllDialoguesController)
);

router.post(
  "/delete",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.deleteDialogueController)
);

router.post(
  "/deleteNewMessage",
  authorize,
  validateBody(schemas.deleteDialogueNewMessageSchema),
  ctrlWrapper(ctrl.deleteDialogueNewMessageController)
);

router.post(
  "/order",
  authorize,
  validateBody(schemas.orderDialogueSchema),
  ctrlWrapper(ctrl.orderDialogueController)
);

module.exports = router;
