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

module.exports = router;
