const { User } = require("../models/user");

const { RequestError } = require("../helpers");

const getOtherUserController = async (req, res) => {
  const { userId } = req.body;
  const otherUser = await User.findById(userId);
  if (!otherUser) {
    return next(RequestError(404, "Not found"));
  }
  return res.status(200).json(otherUser);
};

const userSubscriptionsController = async (req, res) => {
  const subscriptions = req.user.userSubscriptions;
  // const subscribedUsers = await User.find({ _id: { $in: subscriptions } });
  const subscribedUsers = await User.find();

  console.log(subscribedUsers);

  const count = subscribedUsers.length;
  const totalPages = Math.ceil(count / limit);
  const skip = (page - 1) * limit;

  if (subscribedUsers.length === 0) {
    res
      .status(200)
      .json({ userSubscriptions: [], totalPagesUserSubscription: 0 });
  } else {
    const paginatedSubscribedUsers = subscribedUsers.slice(skip, skip + limit);
    res.status(200).json({
      userSubscriptions: paginatedSubscribedUsers,
      totalPagesUserSubscription: totalPages,
    });
  }
};

module.exports = {
  getOtherUserController,
  userSubscriptionsController,
};
