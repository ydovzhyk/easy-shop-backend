const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/otherUserController");

const { validateBody, isValidId } = require("../../middlewares");

const router = express.Router();

// Get Other User Info
router.post("/", ctrlWrapper(ctrl.getOtherUserController));

module.exports = router;
