import { Server } from "socket.io";
import { provider } from "../../blockchain/provider";
import { ClientSubscriptions } from "../setupSocket";

let isListening = false;
const DELAY_MS = 5000;

const txQueue: string[] = [];
let isProcessing = false;

export function setupPendingTxs(
  io: Server,
  clientSubs: Map<string, ClientSubscriptions>
) {
  if (isListening) return;

  provider.on("pending", async (txHash) => {
    txQueue.push(txHash);
    if (!isProcessing) {
      processTxQueue(io, clientSubs);
    }
  });

  isListening = true;
}

function processTxQueue(
  io: Server,
  clientSubs: Map<string, ClientSubscriptions>
) {
  isProcessing = true;

  const processNext = async () => {
    const txHash = txQueue.shift();
    if (!txHash) {
      isProcessing = false;
      return;
    }

    try {
      const tx = await provider.getTransaction(txHash);
      if (tx) {
        for (const [socketId, subs] of clientSubs.entries()) {
          if (subs.txs) {
            io.to(socketId).emit("pendingTx", tx);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching tx:", error);
    }

    setTimeout(processNext, DELAY_MS);
  };

  processNext();
}
