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
  const page = req.body.currentPage || 1;
  const limit = 5;
  const subscribedUsers = await User.find({ _id: { $in: subscriptions } });

  const count = subscribedUsers.length;
  const totalPages = Math.ceil(count / limit);
  const skip = (page - 1) * limit;

  if (subscribedUsers.length === 0) {
    res
      .status(200)
      .json({ userSubscriptions: [], totalPagesUserSubscription: 1 });
  } else {
    const paginatedSubscribedUsers = subscribedUsers.slice(skip, skip + limit);

    res.status(200).json({
      userSubscriptions: paginatedSubscribedUsers,
      totalPagesUserSubscription: totalPages,
    });
  }
};

const userDeleteSubscriptionsController = async (req, res) => {
  let subscriptions = req.user.userSubscriptions;
  const userId = req.user._id;
  const unSubscribeUser = req.body.userSubscriptionId;

  subscriptions = subscriptions.filter(
    (subscriptionId) => subscriptionId.toString() !== unSubscribeUser.toString()
  );

  const otherUser = await User.findById(unSubscribeUser);
  let otherUserFollowers = otherUser.userFollowers;
  otherUserFollowers = otherUserFollowers.filter(
    (followerId) => followerId.toString() !== userId.toString()
  );
  await User.findByIdAndUpdate(unSubscribeUser, {
    userFollowers: otherUserFollowers,
  });

  await User.findByIdAndUpdate(userId, { userSubscriptions: subscriptions });
  const subscribedUsers = await User.find({ _id: { $in: subscriptions } });

  const count = subscribedUsers.length;
  const page = 1;
  const limit = 5;
  const totalPages = Math.ceil(count / limit);
  const skip = (page - 1) * limit;

  if (subscribedUsers.length === 0) {
    res
      .status(200)
      .json({ userSubscriptions: [], totalPagesUserSubscription: 1 });
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
  userDeleteSubscriptionsController,
};
