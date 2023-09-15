const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/reviewController");

const { validateBody, authorize, isValidId } = require("../../middlewares");

const { schemas } = require("../../models/review");

const router = express.Router();

// addReview
router.post(
  "/add",
  authorize,
  validateBody(schemas.addReviewSchema),
  ctrlWrapper(ctrl.addReviewController)
);

router.get("/:reviewId", isValidId, ctrlWrapper(ctrl.getReviewByIdController));

// delete Review by id
router.delete(
  "/delete/:reviewId",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.deleteReviewController)
);

// get user Review
router.post(
  "/user-reviews",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.getUserReviewsController)
);

// get user feedback
router.post(
  "/user-feedback",
  validateBody(schemas.getUserFeedbackSchema),
  ctrlWrapper(ctrl.getUserFeedbackController)
);

// update user feedback
router.post(
  "/update",
  authorize,
  validateBody(schemas.updateReviewSchema),
  ctrlWrapper(ctrl.updateReviewController)
);

// get all reviews
router.get("/", ctrlWrapper(ctrl.getReviewsController));

module.exports = router;
