const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_API_KEY, SENDGRID_SENDER } = process.env;

const sendTechnicialMail = async (user, textUser, owner, textOwner) => {
  sgMail.setApiKey(SENDGRID_API_KEY);

  const sendMail = async (mail, text) => {
    const msg = {
      to: mail,
      from: SENDGRID_SENDER,
      subject: "EasyShop site email",
      text: text,
      html: `<p>${text}</p> 
      <br>
        <p>З повагою команда сайту,</p> 
        <a target="_blank" href="https://ydovzhyk.github.io/easy-shop/">EasyShop</a>`,
    };
    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const emailToUser = await sendMail(user, textUser);
  const emailToOwner = await sendMail(owner, textOwner);

  if (emailToUser && emailToOwner) {
    return true;
  }
};

module.exports = sendTechnicialMail;
