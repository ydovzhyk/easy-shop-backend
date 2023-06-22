const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/verifyController");

const { validateBody, isValidId, authorize } = require("../../middlewares");
const { schemas } = require("../../models/user");
const router = express.Router();

const rememberReferer = (req, res, next) => {
  const referer = req.get("Referer");
  try {
    req.session.referer = referer;
  } catch (error) {
    next(error);
  }
  next();
};

// verification
router.post(
  "/",
  authorize,
  rememberReferer,
  validateBody(schemas.verificationSchema),
  ctrlWrapper(ctrl.verificationController)
);

router.get("/:verificationToken", ctrlWrapper(ctrl.verifyController));

// router.post(
//   "/repeat",
//   validateBody(schemas.emailSchema),
//   ctrlWrapper(ctrl.resendEmailController)
// );

module.exports = router;
