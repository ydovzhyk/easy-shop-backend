const {isValidObjectId} = require("mongoose");

const {RequestError} = require("../helpers");

const isValidId = (req, res, next) => {
    const { transitionId } = req.params;
    const { userId } = req.params;
    if(!isValidObjectId(transitionId || userId)) {
        next(RequestError(400, "is not valid id format"))
    }
    next();
}

module.exports = isValidId;