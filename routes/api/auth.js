const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/authController");

const {
  validateBody,
  isValidId,
  authorize,
  authenticateRefresh,
} = require("../../middlewares");
const { schemas } = require("../../models/user");
const router = express.Router();

// signup
router.post(
  "/register",
  validateBody(schemas.registerSchema),
  ctrlWrapper(ctrl.register)
);

// login
router.post(
  "/login",
  validateBody(schemas.loginSchema),
  ctrlWrapper(ctrl.login)
);

// logout
router.post("/logout", authorize, ctrlWrapper(ctrl.logout));

// delete user
router.delete(
  "/:userId",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.deleteUserController)
);

// refresh user
router.post(
  "/refresh",
  authenticateRefresh,
  validateBody(schemas.refreshTokenSchema),
  ctrlWrapper(ctrl.refresh)
);

// get current user
router.post("/current", authorize, ctrlWrapper(ctrl.getUserController));

// update user settings
router.post(
  "/update/settings",
  authorize,
  validateBody(schemas.updateUserSettingsSchema),
  ctrlWrapper(ctrl.updateUserSettigsController)
);

router.post(
  "/basket",
  authorize,
  validateBody(schemas.updateUserBasketSchema),
  ctrlWrapper(ctrl.updateUserBasket)
);

router.post("/likes", authorize, isValidId, ctrlWrapper(ctrl.updateUserLikes));

router.post(
  "/info",
  authorize,
  validateBody(schemas.userLikesBasketSchema),
  ctrlWrapper(ctrl.getUserLikesBasket)
);

router.post(
  "/subscribes",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.updateUserSubscribes)
);

router.post(
  "/subscribes/search",
  authorize,
  validateBody(schemas.updateUserSearchSubscribesSchema),
  ctrlWrapper(ctrl.updateUserSearchSubscribes)
);

module.exports = router;
