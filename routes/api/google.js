const express = require("express");

const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/authController");

const { passport } = require("../../middlewares");
const router = express.Router();

// google auth
router.get(
  "/",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/callback",
  passport.authenticate("google", { session: false }),
  ctrlWrapper(ctrl.googleAuthController)
);

module.exports = router;
