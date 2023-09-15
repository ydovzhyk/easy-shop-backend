const { isValidObjectId } = require("mongoose");
const { RequestError } = require("../helpers");

const isValidId = (req, res, next) => {
  const productId =
    req.params.productId ||
    req.body.productId ||
    req.params.reviewId ||
    req.params.orderId ||
    req.body.dialogueId;
  const userId =
    req.params.userId ||
    req.body.userId ||
    req.body.userSubscriptionId ||
    req.params.ownerId;

  try {
    const objectId = isValidObjectId(productId) ? productId : userId;
    if (!isValidObjectId(objectId)) {
      throw new Error("is not a valid ObjectId");
    }
    next();
  } catch (error) {
    next(RequestError(400, error.message));
  }
};

module.exports = isValidId;
