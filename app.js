const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const authRouter = require("./routes/api/auth");
const googleRouter = require("./routes/api/google");
const productRouter = require("./routes/api/product");
const { DB_HOST } = process.env;

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(
  session({
    secret: `${DB_HOST}`,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.json());
app.use("/static", express.static("public")); // For access a file

app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/", googleRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({
    message,
  });
});

module.exports = app;
