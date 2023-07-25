const mongoose = require("mongoose");
const app = require("./app");
const dialogueController = require("./controllers/dialogueController");

mongoose.set("strictQuery", false);
const { DB_HOST, PORT = 4000 } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT, () => console.log("Server started on port", PORT));
  })
  .catch((error) => {
    console.log("Error", error.message);
    process.exit(1);
  });
