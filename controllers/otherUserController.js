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

module.exports = {
  getOtherUserController,
};
