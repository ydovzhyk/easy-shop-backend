const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/api/auth");
const googleRouter = require("./routes/api/google");
const productRouter = require("./routes/api/product");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "https://ydovzhyk.github.io"],
//   })
// );
// app.use((req, res, next) => {
//   res.setHeader(
//     "Access-Control-Allow-Origin",
//     "https://ydovzhyk.github.io/easy-shop/;http://localhost:3000"
//   );
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

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
