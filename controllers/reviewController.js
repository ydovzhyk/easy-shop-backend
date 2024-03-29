const { User } = require("../models/user");
const { Review } = require("../models/review");
const { Order } = require("../models/order");
const { RequestError } = require("../helpers");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

//add Review
const addReviewController = async (req, res, next) => {
  try {
    const { _id: reviewOwner, username, userAvatar } = req.user;
    const { orderId, sellerId, products, rating, feedback, feedbackType } =
      req.body;
    const currentDate = moment().tz("Europe/Kiev").format("DD.MM.YYYY HH:mm");

    const order = await Order.findById(orderId);

    const newReview = await Review.create({
      sellerId: sellerId ? sellerId : order.sellerId,
      orderId,
      customerId: order.client.customerId,
      products: products,
      reviewer: {
        reviewerId: reviewOwner,
        reviewerName: username ? username : "unknown",
        reviewerFoto: userAvatar ? userAvatar : "",
      },
      reviewDate: currentDate,
      rating,
      feedback,
      feedbackType,
    });

    await User.findOneAndUpdate(
      { _id: reviewOwner },
      { $push: { userReviews: newReview._id } },
      { new: true }
    );

    const feedbackOwnerId =
      feedbackType === "asSeller" ? newReview.customerId : newReview.sellerId;

    const updatedFeedbackOwner = await User.findOneAndUpdate(
      { _id: feedbackOwnerId },
      {
        $push: {
          userFeedback: {
            id: newReview._id,
            rating: newReview.rating,
            feedbackType,
          },
        },
      },
      { new: true }
    );

    const sellerFeedback = updatedFeedbackOwner.userFeedback;
    const totalRating = sellerFeedback.reduce(
      (sum, feedback) => sum + feedback.rating,
      0
    );

    const averageRating = totalRating / sellerFeedback.length;
    const roundedAverageRating = averageRating.toFixed(2);

    await User.findOneAndUpdate(
      { _id: feedbackOwnerId },
      { rating: roundedAverageRating }
    );

    res.status(200).json({
      message: "Review added successfully",
      newReview,
    });
  } catch (error) {
    next(error);
  }
};

//get Review by ID
const getReviewByIdController = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const reviewById = await Review.findById(reviewId);
    if (!reviewById) {
      return next(RequestError(404, "Not found"));
    }
    return res.status(200).json(reviewById);
  } catch (error) {
    next(error);
  }
};

//delete Review
const deleteReviewController = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const reviewById = await Review.findById(reviewId);
    const ownerId = reviewById.reviewer.reviewerId;
    const feedbackType = reviewById.feedbackType;
    const feedbackOwnerId =
      feedbackType === "asSeller" ? reviewById.customerId : reviewById.sellerId;
    try {
      await Review.deleteOne({ _id: reviewId });

      const updatedClient = await User.findOneAndUpdate(
        { _id: ownerId },
        { $pull: { userReviews: reviewId } },
        { new: true }
      );

      if (!updatedClient) {
        throw new Error("Client not found");
      }

      const updatedFeedbackOwner = await User.findOneAndUpdate(
        { _id: feedbackOwnerId },
        { $pull: { userFeedback: { id: mongoose.Types.ObjectId(reviewId) } } },
        { new: true }
      );

      if (!updatedFeedbackOwner) {
        throw new Error("FeedbackOwner not found");
      }

      res.status(200).json({ message: "Review deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting Review" });
    }
  } catch (error) {
    next(error);
  }
};

// get User Reviews
const getUserReviewsController = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const userReviews = await Review.find({
      "reviewer.reviewerId": userId,
    }).sort({ reviewDate: -1 });

    res.status(200).json({
      reviews: userReviews,
    });
  } catch (error) {
    next(error);
  }
};

// get User feedback
const getUserFeedbackController = async (req, res, next) => {
  try {
    const { userId, feedbackType } = req.body;

    let userFeedback = [];
    if (feedbackType === "asSeller") {
      userFeedback = await Review.find({
        sellerId: userId,
        feedbackType: "asCustomer",
      }).sort({
        reviewDate: -1,
      });
    }
    if (feedbackType === "asCustomer") {
      userFeedback = await Review.find({
        customerId: userId,
        feedbackType: "asSeller",
      }).sort({
        reviewDate: -1,
      });
    }
    if (!feedbackType) {
      userFeedback = await Review.find({
        $or: [{ sellerId: userId }, { customerId: userId }],
        "reviewer.reviewerId": { $ne: userId },
      }).sort({
        reviewDate: -1,
      });
    }
    res.status(200).json({
      feedback: userFeedback,
    });
  } catch (error) {
    next(error);
  }
};

//get all Reviews
const getReviewsController = async (req, res) => {
  const reviews = await Review.find();
  res.status(200).json(reviews);
};

//update Review
const updateReviewController = async (req, res, next) => {
  try {
    const { reviewId, rating, feedback } = req.body;

    const reviewById = await Review.findById(reviewId);

    const updatedReview = await Review.findOneAndUpdate(
      { _id: reviewId },
      {
        rating: rating ? rating : reviewById.rating,
        feedback: feedback ? feedback : reviewById.feedback,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Review edit successfully",
      updatedReview,
      code: 200,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReviewController,
  getReviewByIdController,
  deleteReviewController,
  getUserReviewsController,
  getUserFeedbackController,
  getReviewsController,
  updateReviewController,
};
