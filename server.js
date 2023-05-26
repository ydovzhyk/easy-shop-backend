const mongoose = require("mongoose");
const app = require("./app");

mongoose.set('strictQuery', false);
const { DB_HOST, PORT = 4000 } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() =>
    app.listen(PORT, () => console.log("Database connection successful"))
  )
  .catch((error) => {
    console.log("Error", error.message);
    process.exit(1);
  });
