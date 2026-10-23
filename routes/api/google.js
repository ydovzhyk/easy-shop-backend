const express = require("express");

const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/authController");

const { passport } = require("../../middlewares");
const { encodeReferer } = require("../../helpers/frontendRedirect");
const router = express.Router();

const rememberReferer = (req, res, next) => {
  const referer = req.headers.referer || req.headers.origin || "";
  if (req.session) {
    req.session.referer = referer;
  }
  req.googleRefererState = encodeReferer(referer);
  next();
};

// google auth
router.get("/", rememberReferer, (req, res, next) => {
  passport.authenticate("google", {
    scope: ["email", "profile"],
    state: req.googleRefererState,
  })(req, res, next);
});

router.get(
  "/callback",
  passport.authenticate("google", { session: false }),
  ctrlWrapper(ctrl.googleAuthController)
);

module.exports = router;
