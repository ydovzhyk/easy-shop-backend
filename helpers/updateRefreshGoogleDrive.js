const axios = require("axios");
const {
  GOOGLE_DRIVE_CLIENT_SECRET,
  GOOGLE_DRIVE_CLIENT_ID,
  GOOGLE_DRIVE_REFRESH_TOKEN,
} = process.env;

const updateRefreshGoogleDrive = () => {
  console.log("Зайшли оновити Refresh");
  const data = {
    refresh_token: GOOGLE_DRIVE_REFRESH_TOKEN,
    client_id: GOOGLE_DRIVE_CLIENT_ID,
    client_secret: GOOGLE_DRIVE_CLIENT_SECRET,
    grant_type: "refresh_token",
  };

  axios
    .post("https://oauth2.googleapis.com/token", data)
    .then((response) => {
      // Отримано відповідь з новим refresh_token
      console.log(response);
      const newRefreshToken = response.data.refresh_token;
      console.log("New Refresh Token:", newRefreshToken);
      // Тут можна зберегти новий refresh_token в вашій базі даних або де-небудь інде
    })
    .catch((error) => {
      console.error("Error refreshing token:", error.message);
    });
};

module.exports = updateRefreshGoogleDrive;
