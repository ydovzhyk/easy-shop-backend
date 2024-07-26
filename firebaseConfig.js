const admin = require("firebase-admin");
const serviceAccount = require("./helpers/adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "apartment-rent-yd.appspot.com",
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
