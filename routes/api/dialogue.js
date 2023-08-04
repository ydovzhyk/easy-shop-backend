const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/dialogueController");

const { validateBody, isValidId, authorize } = require("../../middlewares");
const { schemas } = require("../../models/user");
const router = express.Router();

// create new dialogue
router.post(
  "/create",
  authorize,
  //   validateBody(schemas.verificationSchema),
  ctrlWrapper(ctrl.createDialogueController)
);

router.post(
  "/get",
  authorize,
  //   validateBody(schemas.verificationSchema),
  ctrlWrapper(ctrl.getDialogueController)
);

router.post(
  "/getData",
  authorize,
  //   validateBody(schemas.verificationSchema),
  ctrlWrapper(ctrl.getAllDialoguesController)
);

router.post(
  "/delete",
  authorize,
  //   validateBody(schemas.verificationSchema),
  ctrlWrapper(ctrl.deleteDialogueController)
);

router.post(
  "/deleteNewMessage",
  authorize,
  //   validateBody(schemas.verificationSchema),
  ctrlWrapper(ctrl.deleteDialogueNewMessageController)
);

router.post(
  "/order",
  authorize,
  //   validateBody(schemas.verificationSchema),
  ctrlWrapper(ctrl.orderDialogueController)
);

module.exports = router;
