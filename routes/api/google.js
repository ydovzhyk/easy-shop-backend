const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/authController");

const { passport } = require("../../middlewares");
const router = express.Router();

// google auth
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["email", "profile"] })
// );

router.get("/google", (req, res, next) => {
  // Додайте параметр до URL-адреси, щоб передати інформацію про посилання або тип запиту
  const redirectURL = `${req.originalUrl}?from=google`;
  passport.authenticate("google", {
    scope: ["email", "profile"],
    callbackURL: redirectURL,
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  ctrlWrapper(ctrl.googleAuthController)
);

module.exports = router;
