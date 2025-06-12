import { WebSocket } from "ws";
import { unregisterClient } from "./clientRegistry";

export function setupKeepAlive(ws: WebSocket) {
  let isAlive = true;

  const interval = setInterval(() => {
    if (!isAlive) {
      ws.terminate();
      clearInterval(interval);
      unregisterClient(ws);
      return;
    }
    isAlive = false;
    ws.ping();
  }, 15000);

  ws.on("pong", () => {
    isAlive = true;
  });

  ws.on("close", () => {
    clearInterval(interval);
    unregisterClient(ws);
  });
}
