const mongoose = require("mongoose");
const app = require("./app");
const http = require("http");
const startWebSocketServer = require("./wsserver");

mongoose.set("strictQuery", false);
const { DB_HOST, PORT = 4000 } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() => {
    // app.listen(PORT, () => console.log("Server started on port", PORT));
    const httpServer = http.createServer(app);
    httpServer.listen(PORT, () => console.log("Server started on port", PORT));
    startWebSocketServer(httpServer); // Запускаємо WebSocket-сервер, передавши HTTP-сервер як параметр
  })
  .catch((error) => {
    console.log("Error", error.message);
    process.exit(1);
  });
