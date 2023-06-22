const express = require("express");

const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/authController");

const { passport } = require("../../middlewares");
const router = express.Router();

const rememberReferer = (req, res, next) => {
  const referer = req.headers.referer || req.headers.origin;
  try {
    req.session.referer = referer;
  } catch (error) {
    next(error);
  }
  next();
};

// google auth
router.get(
  "/",
  rememberReferer,
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/callback",
  passport.authenticate("google", { session: false }),
  ctrlWrapper(ctrl.googleAuthController)
);

module.exports = router;
