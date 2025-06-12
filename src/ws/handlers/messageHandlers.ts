import { MessageType, WebSocketMessage } from "../../interfaces/validates";
import {
  allTxClients,
  balanceWatchers,
  registerClientInSet,
  specificTxClients,
} from "../../utils/clientRegistry";
import {
  getAllPendingTxs,
  getSpecificPendingTxs,
  watchBalance,
} from "../functions/Transactions";
import { WebSocket } from "ws";

export const messageHandlers: Record<
  MessageType,
  (ws: WebSocket, msg: WebSocketMessage) => Promise<void>
> = {
  allTransactions: async (ws) => {
    allTxClients.add(ws);
    await getAllPendingTxs(allTxClients);
  },

  oneAddress: async (ws, msg) => {
    const address = msg.data?.address;
    if (!address) {
      return ws.send(JSON.stringify({ error: "Address not provided" }));
    }
    registerClientInSet(specificTxClients, address, ws);
    if (specificTxClients.get(address)!.size === 1) {
      await getSpecificPendingTxs(address, specificTxClients.get(address)!);
    }
  },

  getBalance: async (ws, msg) => {
    const address = msg.data?.address;
    if (!address) {
      return ws.send(JSON.stringify({ error: "Address not provided" }));
    }
    registerClientInSet(balanceWatchers, address, ws);
    if (balanceWatchers.get(address)!.size === 1) {
      await watchBalance(address, balanceWatchers.get(address)!);
    }
  },
};
