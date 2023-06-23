const { User } = require("../models/user");
const { v4: uuidv4 } = require("uuid");

const { RequestError, sendMail } = require("../helpers/");

const verificationController = async (req, res) => {
  const { _id: userId } = req.user;
  const { email } = req.body;
  const referer = req.headers.referer || req.headers.origin;

  const verificationToken = uuidv4();

  await User.findOneAndUpdate(
    userId,
    { verificationToken: verificationToken, email: email },
    { new: true }
  );

  let serverUrl = "";
  if (process.env.NODE_ENV === "production") {
    serverUrl = "https://easy-shop-backend.herokuapp.com";
  } else {
    serverUrl = "http://localhost:4000";
  }
  const result = await sendMail(email, serverUrl, verificationToken, referer);

  if (result) {
    req.session = null;
    res.status(201).send({ message: "Go to your inbox to confirm your email" });
  } else {
    res.status(400).send({
      message: "The email could not be sent, please try again later",
    });
  }
};

const verifyController = async (req, res) => {
  const { verificationToken } = req.params;
  const { url } = req.query;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw RequestError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  res.redirect(`${url}?message=Verification successful`);
};

module.exports = {
  verifyController,
  verificationController,
};
