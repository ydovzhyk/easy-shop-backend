const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const authRouter = require("./routes/api/auth");
const googleRouter = require("./routes/api/google");
const productRouter = require("./routes/api/product");
const otherUserRouter = require("./routes/api/otherUser");
const verifyRouter = require("./routes/api/verify");
const dialogueRouter = require("./routes/api/dialogue");
const orderRouter = require("./routes/api/order");
const reviewsRouter = require("./routes/api/review");

const { GOOGLE_CLIENT_SECRET } = process.env;

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());

app.use(express.json());
app.use("/static", express.static("public")); // For access a file

app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/other-user", otherUserRouter);
app.use("/verify", verifyRouter);
app.use("/dialogue", dialogueRouter);
app.use("/orders", orderRouter);
app.use("/reviews", reviewsRouter);

app.use(
  "/google",
  session({
    secret: `${GOOGLE_CLIENT_SECRET}`,
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/google", googleRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  if (err.message.includes("Cast to ObjectId failed for value")) {
    return res.status(400).json({
      message: "id is invalid",
    });
  }
});

app.use((err, req, res, next) => {
  if (err) {
    res.status(500).json({
      message: "Server error",
    });
  } else {
    return;
  }
});

module.exports = app;
