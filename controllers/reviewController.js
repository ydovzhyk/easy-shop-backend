const { User } = require("../models/user");
const { Review } = require("../models/review");
const { RequestError } = require("../helpers");
const moment = require("moment");

const addReviewController = async (req, res) => {
  const { _id: clientId, username, userAvatar } = req.user;
  const { orderId, sellerId, products, rating } = req.body;
  const currentDate = moment().format("DD.MM.YYYY HH:mm");

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
      { $push: { userFeedback: newReview._id } },
      { new: true }
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
      { $pull: { userFeedback: reviewId } },
      { new: true }
    );

    if (!updatedSeller) {
      throw new Error("Seller not found");
    }

    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Review" });
  }
  res.status(200).json({ message: "Review deleted" });
};

// get User Reviews
const getUserReviewsController = async (req, res) => {
  const { _id: userId } = req.user;
  // console.log(userId);

  const userReviews = await Review.find({ "reviewer.reviewerId": userId }).sort(
    { orderDate: -1 }
  );
 
  res.status(200).json({
    reviews: userReviews,
  });
};

// get User feedback
const getUserFeedbackController = async (req, res) => {
  const { _id: userId } = req.user;
  // console.log(userId);
    const userFeedback = await Review.find({ sellerId: userId }).sort({
      orderDate: -1,
    });

  res.status(200).json({
    feedback: userFeedback,
  });
};

module.exports = {
  addReviewController,
  getReviewByIdController,
  deleteReviewController,
  getUserReviewsController,
  getUserFeedbackController,
};
