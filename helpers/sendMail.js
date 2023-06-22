const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_API_KEY, SENDGRID_SENDER } = process.env;

let senderUrl = "";
const sendMail = async (email, serverUrl, verificationToken, referer) => {
  if (referer === "https://ydovzhyk.github.io") {
    senderUrl = "https://ydovzhyk.github.io/easy-shop/";
  } else {
    senderUrl = referer;
  }
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(SENDGRID_API_KEY);
  const msg = {
    to: email,
    from: SENDGRID_SENDER,
    subject: "EasyShop site email confirmation",
    text: "EasyShop site email confirmation",
    html: `<a target="_blank" href="${serverUrl}/verify/${verificationToken}?url=${senderUrl}">Follow the link to confirm your email</a>`,
  };
  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports = sendMail;
