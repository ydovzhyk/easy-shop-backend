const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");
const { Session } = require("../models/session");
const { v4: uuidv4 } = require("uuid");

const { EMAIL } = process.env;

const { RequestError, sendMail } = require("../helpers/");

const verificationController = async (req, res) => {
  const { _id: userId } = req.user;
  const { email } = req.body;
  const url = req.session.referer;
  const verificationToken = uuidv4();

  const updatedUser = await User.findOneAndUpdate(
    userId,
    { verificationToken: verificationToken, email: email },
    { new: true }
  );

  let serverUrl = "";
  if (process.env.NODE_ENV === "production") {
    serverUrl = "https://easy-shop-backend.herokuapp.com/";
  } else {
    serverUrl = "http://localhost:4000";
  }
  const result = await sendMail(email, serverUrl, verificationToken, url);

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
  console.log(url);
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

const resendEmailController = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw RequestError(404, "User not found");
  }

  if (user.verify) {
    throw RequestError(400, "Verification has already been passed");
  }

  const mail = {
    to: email,
    subject: "Site registration confirmation",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Follow the link to confirm your registration</a>`,
  };

  await sendMail(mail);

  res.json({
    message: "Verification email sent",
  });
};

module.exports = {
  verifyController,
  verificationController,
  resendEmailController,
};
