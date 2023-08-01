const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();
const dialogueController = require("./controllers/dialogueController");
// WS Server
const { Server } = require("ws");
// const http = require("http");
// const WebSocket = require("ws");
const url = require("url");

const authRouter = require("./routes/api/auth");
const googleRouter = require("./routes/api/google");
const productRouter = require("./routes/api/product");
const otherUserRouter = require("./routes/api/otherUser");
const verifyRouter = require("./routes/api/verify");
const dialogueRouter = require("./routes/api/dialogue");
const orderRouter = require("./routes/api/order");

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
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({
    message,
  });
});

// WS Server
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// // Об'єкт для зберігання WebSocket-з'єднань за їхнім ID
// const connectedClients = {};

// // Опрацювання підключення до WebSocket сервера
// wss.on("connection", (ws, req) => {
//   const query = url.parse(req.url, true).query;
//   // Генерування ID для підключення
//   const connectionId = query.user;
//   // Збереження WebSocket-з'єднання в об'єкті connectedClients
//   connectedClients[connectionId] = ws;

//   // Опрацювання повідомлень, що надходять до WebSocket сервера
//   ws.on("message", async (message) => {
//     // Отримання ID підключення відправника
//     const senderId = findConnectionIdByWebSocket(ws);
//     // Отримання WebSocket-з'єднання відправника
//     const senderWebSocket = connectedClients[senderId];

//     // Код для обробки повідомлення та підготовки відповіді
//     const response = await dialogueController.checkUpdatesDialogueController(
//       JSON.parse(message.toString())
//     );

//     // Відправка відповіді конкретному клієнту
//     if (senderWebSocket && senderWebSocket.readyState === WebSocket.OPEN) {
//       senderWebSocket.send(JSON.stringify(response.message));
//     }
//   });

//   // Обробник події закриття WebSocket-з'єднання
//   ws.on("close", () => {
//     // Видалення WebSocket-з'єднання з об'єкта connectedClients
//     delete connectedClients[findConnectionIdByWebSocket(ws)];
//   });
// });

// // Розпочати слухання на порті
// const port = process.env.PORT_WS || 5000;
// server.listen(port, () => {
//   console.log(`Сервер слухає на порті ${port}`);
// });

// // Функція для пошуку ID підключення за WebSocket-з'єднанням
// function findConnectionIdByWebSocket(ws) {
//   return Object.keys(connectedClients).find(
//     (id) => connectedClients[id] === ws
//   );
// }

// const PORT = process.env.PORT_WS || 5000;

// const INDEX = "/index.html";

// const WSserver = express()
//   .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
//   .listen(PORT, () => console.log(`Listening on ${PORT}`));

// const wss = new Server({ server: WSserver });

// const connectedClients = {};

// wss.on("headers", (headers, req) => {
//   headers.push("Access-Control-Allow-Origin: *");
//   headers.push(
//     "Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept"
//   );
// });

// wss.on("connection", (ws, req) => {
//   const query = url.parse(req.url, true).query;
//   const connectionId = query.user;
//   connectedClients[connectionId] = ws;
//   console.log(`Client ${connectionId} connected`);

//   ws.on("message", async (message) => {
//     // Код для обробки повідомлення та підготовки відповіді
//     const response = await dialogueController.checkUpdatesDialogueController(
//       JSON.parse(message.toString())
//     );

//     // Отримання ID підключення відправника
//     const senderId = findConnectionIdByWebSocket(ws);
//     // Отримання WebSocket-з'єднання відправника
//     const senderWebSocket = connectedClients[senderId];

//     // Відправка відповіді конкретному клієнту
//     if (senderWebSocket && senderWebSocket.readyState === 1) {
//       console.log("Зайшли відправити відповідь");
//       senderWebSocket.send(JSON.stringify(response.message));
//     }
//   });

//   ws.on("close", () => console.log("Client disconnected"));
// });

// // Функція для пошуку ID підключення за WebSocket-з'єднанням
// function findConnectionIdByWebSocket(ws) {
//   return Object.keys(connectedClients).find(
//     (id) => connectedClients[id] === ws
//   );
// }

// setInterval(() => {
//   wss.clients.forEach((client) => {
//     client.send(new Date().toTimeString());
//   });
// }, 10000);

module.exports = app;
