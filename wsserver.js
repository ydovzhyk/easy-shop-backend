const { Server } = require("ws");
const url = require("url");
const dialogueController = require("./controllers/dialogueController");

const connectedClients = {};

function findConnectionIdByWebSocket(ws) {
  return Object.keys(connectedClients).find(
    (id) => connectedClients[id] === ws
  );
}

function startWebSocketServer(httpServer) {
  const wss = new Server({ server: httpServer });

  wss.on("connection", (ws, req) => {
    const query = url.parse(req.url, true).query;
    const connectionId = query.user;
    connectedClients[connectionId] = ws;
    console.log(`Client ${connectionId} connected`);

    ws.on("message", async (message) => {
      // Код для обробки повідомлення та підготовки відповіді
      const response = await dialogueController.checkUpdatesDialogueController(
        JSON.parse(message.toString())
      );

      const senderId = findConnectionIdByWebSocket(ws);
      const senderWebSocket = connectedClients[senderId];

      if (senderWebSocket && senderWebSocket.readyState === 1) {
        console.log("Зайшли відправити відповідь", response.message);
        senderWebSocket.send(JSON.stringify(response.message));
      }
    });

    ws.on("close", () => console.log("Client disconnected"));
  });
}

module.exports = startWebSocketServer;
