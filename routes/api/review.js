const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/reviewController");

const { validateBody, authorize } = require("../../middlewares");

const { schemas } = require("../../models/review");

const router = express.Router();

// addReview
router.post(
  "/add",
  authorize,
  validateBody(schemas.addReviewSchema),
  ctrlWrapper(ctrl.addReviewController)
);

router.get("/:reviewId", ctrlWrapper(ctrl.getReviewByIdController));

// delete Review by id
router.delete(
  "/delete/:reviewId",
  authorize,
  ctrlWrapper(ctrl.deleteReviewController)
);

// get user Review
router.post(
  "/user-reviews",
  authorize,
  ctrlWrapper(ctrl.getUserReviewsController)
);

// get user feedback
router.post("/user-feedback", authorize, ctrlWrapper(ctrl.getUserFeedbackController));

module.exports = router;
