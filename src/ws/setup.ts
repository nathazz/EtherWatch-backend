import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import {
  getAllPendingTxs,
  getSpecificPendingTxs,
  watchBalance,
} from "./functions/Transactions";
import { MESSAGE_TYPES } from "../utils/constants";

const setClients = new Set<WebSocket>();
const setAllTx = new Set<WebSocket>();
const setSpecificPendingTx = new Set<WebSocket>();
const setGetBalance = new Set<WebSocket>();

let isProviderListening = false;

export async function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    setClients.add(ws);
    ws.send(JSON.stringify({ type: "connected" }));

    let isAlive = true;

    const interval = setInterval(() => {
      if (!isAlive) {
        clearInterval(interval);
        ws.terminate();

        setClients.delete(ws);
        setSpecificPendingTx.delete(ws);
        setAllTx.delete(ws);
        setGetBalance.delete(ws);
        return;
      }

      isAlive = false;
      ws.ping();
    }, 15000);

    ws.on("pong", () => {
      isAlive = true;
    });

    ws.on("message", async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const address = msg.data?.address;

        switch (msg.type) {
          case MESSAGE_TYPES.ALL_TRANSACTIONS:
            setAllTx.add(ws);

            if (!isProviderListening) {
              await getAllPendingTxs(setAllTx);
              isProviderListening = true;
            }

            break;

          case MESSAGE_TYPES.ONE_ADDRESS:

            if (!address) {
              ws.send(JSON.stringify({ error: "Address not provided" }));
              return;
            }

            setSpecificPendingTx.add(ws);

            if (!isProviderListening) {
              await getSpecificPendingTxs(address, setSpecificPendingTx);
              isProviderListening = true;
            }

            break;

          case MESSAGE_TYPES.GET_BALANCE:

            if (!address) {
              ws.send(JSON.stringify({ error: "Address not provided" }));
              return;
            }

            setGetBalance.add(ws);

            if (!isProviderListening) {
              await watchBalance(address, setGetBalance);
              isProviderListening = true;
            }

            break;

          default:
            ws.send(
              JSON.stringify({ error: `Unknown message type: ${msg.type}` }),
            );
        }
      } catch (err) {
        ws.send(JSON.stringify({ error: `Invalid message received: ${data}` }));
      }
    });

    ws.on("close", () => {
      clearInterval(interval);
      setClients.delete(ws);
      setAllTx.delete(ws);
      setSpecificPendingTx.delete(ws);
      setGetBalance.delete(ws);
    });

    ws.on("error", (err) => {
      ws.send(JSON.stringify({ error: `WebSocket error:${err}` }));
      setClients.delete(ws);
      setSpecificPendingTx.delete(ws);
      setAllTx.delete(ws);
      setGetBalance.delete(ws);
    });
  });
}
