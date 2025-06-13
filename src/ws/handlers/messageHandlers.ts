import { ethers } from "ethers";
import { MessageType, WebSocketMessage } from "../../interfaces/validates";
import {
  allTxClients,
  balanceWatchers,
  gasFeeClients,
  registerClientInSet,
} from "../../utils/clientRegistry";
import {
  getAllPendingTxs,
  getFeeData,
  watchBalance,
} from "../functions/ethEvents";
import { WebSocket } from "ws";

export const messageHandlers: Record<
  MessageType,
  (ws: WebSocket, msg: WebSocketMessage) => Promise<void>
> = {
  allTransactions: async (ws) => {
    try {
      allTxClients.add(ws);
      await getAllPendingTxs(allTxClients);
    } catch (error) {
      ws.send(JSON.stringify({ error: "Internal server error" }));
      console.error(error);
    }
  },

  getBalance: async (ws, msg) => {
    try {
      const address = msg.data?.address;

      if (!address) {
        return ws.send(JSON.stringify({ error: "Address not provided" }));
      }

      if (!ethers.isAddress(address)) {
        return ws.send(JSON.stringify({ error: "Invalid Ethereum address" }));
      }

      registerClientInSet(balanceWatchers, address, ws);

      const clientsSet = balanceWatchers.get(address);
      if (clientsSet && clientsSet.size >= 1) {
        await watchBalance(address, balanceWatchers.get(address)!);
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: "Internal server error" }));
      console.error(error);
    }
  },

  feeData: async (ws) => {
    try {
      gasFeeClients.add(ws);
      await getFeeData(gasFeeClients);
    } catch (error) {
      ws.send(JSON.stringify({ error: "Internal server error" }));
      console.error(error);
    }
  },
};
