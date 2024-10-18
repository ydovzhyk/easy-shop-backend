const admin = require("firebase-admin");

const serviceAccount = {
  type: "service_account",
  project_id: "easy-shop-project-20c5b",
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email:
    "firebase-adminsdk-6vq27@easy-shop-project-20c5b.iam.gserviceaccount.com",
  client_id: "111538636001432362764",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-6vq27%40easy-shop-project-20c5b.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "easy-shop-project-20c5b.appspot.com", //Тут уважно, треба взяти там де папки в Firebase
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
