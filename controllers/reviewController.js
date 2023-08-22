const { User } = require("../models/user");
const { Review } = require("../models/review");
const { RequestError } = require("../helpers");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

const addReviewController = async (req, res) => {
  const { _id: clientId, username, userAvatar } = req.user;
  const { orderId, sellerId, products, rating, feedback } = req.body;
  const currentDate = moment().tz("Europe/Kiev").format("DD.MM.YYYY HH:mm");

  const newReview = await Review.create({
    sellerId,
    orderId,
    products: products,
    reviewer: {
      reviewerId: clientId,
      reviewerName: username ? username : "unknown",
      reviewerFoto: userAvatar ? userAvatar : "",
    },
    reviewDate: currentDate,
    rating,
    feedback,
  });
  const updatedUser = await User.findOneAndUpdate(
    { _id: clientId },
    { $push: { userReviews: newReview._id } },
    { new: true }
  );
  const updatedSeller = await User.findOneAndUpdate(
    { _id: newReview.sellerId },
    {
      $push: {
        userFeedback: { id: newReview._id, rating: newReview.rating },
      },
    },
    { new: true }
  );

  const sellerFeedback = updatedSeller.userFeedback;
  const totalRating = sellerFeedback.reduce(
    (sum, feedback) => sum + feedback.rating,
    0
  );

  const averageRating = totalRating / sellerFeedback.length;
  const roundedAverageRating = averageRating.toFixed(2);

  await User.findOneAndUpdate(
    { _id: newReview.sellerId },
    { rating: roundedAverageRating }
  );

  res.status(200).json({
    message: "Review added successfully",
    newReview,
  });
};

//get Review by ID
const getReviewByIdController = async (req, res, next) => {
  const { reviewId } = req.params;
  const reviewById = await Review.findById(reviewId);
  if (!reviewById) {
    return next(RequestError(404, "Not found"));
  }
  return res.status(200).json(reviewById);
};

const deleteReviewController = async (req, res) => {
  const { reviewId } = req.params;
  const reviewById = await Review.findById(reviewId);
  const ownerId = reviewById.reviewer.reviewerId;
  const sellerId = reviewById.sellerId;
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

    const updatedSeller = await User.findOneAndUpdate(
      { _id: sellerId },
      { $pull: { userFeedback: { id: mongoose.Types.ObjectId(reviewId) } } },
      //   { userFeedback: []},
      { new: true }
    );

    if (!updatedSeller) {
      throw new Error("Seller not found");
    }

    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Review" });
  }
};

// get User Reviews
const getUserReviewsController = async (req, res) => {
  const { userId } = req.body;

  const userReviews = await Review.find({ "reviewer.reviewerId": userId }).sort(
    { reviewDate: -1 }
  );

  res.status(200).json({
    reviews: userReviews,
  });
};

// get User feedback
const getUserFeedbackController = async (req, res) => {
  const { sellerId } = req.body;
  const userFeedback = await Review.find({ sellerId: sellerId }).sort({
    reviewDate: -1,
  });

  res.status(200).json({
    feedback: userFeedback,
  });
};

const getReviewsController = async (req, res) => {
  const reviews = await Review.find();
  res.status(200).json(reviews);
};

module.exports = {
  addReviewController,
  getReviewByIdController,
  deleteReviewController,
  getUserReviewsController,
  getUserFeedbackController,
  getReviewsController,
};
