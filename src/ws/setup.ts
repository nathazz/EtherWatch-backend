import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { setupKeepAlive } from "../utils/ping";
import { unregisterClient } from "../utils/clientRegistry";
import { messageHandlers } from "./handlers/messageHandlers";
import { WebSocketMessage } from "../interfaces/validates";

export async function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "connected" }));
    setupKeepAlive(ws);

    ws.on("message", async (data) => {
      try {
        const msg = JSON.parse(data.toString()) as WebSocketMessage;
        const handler = messageHandlers[msg.type];

        if (handler) {
          await handler(ws, msg);
        }
      } catch (err) {
        ws.send(JSON.stringify({ error: `Invalid message received: ${data}` }));
      }
    });

    ws.on("error", (err) => {
      ws.send(JSON.stringify({ error: `WebSocket error: ${err}` }));
      unregisterClient(ws);
    });
  });
}
