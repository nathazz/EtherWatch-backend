import type { WebSocket } from "ws";
import { provider } from "../../blockchain/provider";
import { ethers, formatEther } from "ethers";
import { MESSAGE_TYPES } from "../../utils/constants";

const RATE_LIMIT_MS = 1000;
let lastSentTime = 0;

export async function getAllPendingTxs(subscribers: Set<WebSocket>) {
  provider.on("pending", async (tx) => {
    const now = Date.now();

    if (now - lastSentTime < RATE_LIMIT_MS) return;

    lastSentTime = now;

    const txInfo = await provider.getTransaction(tx);
    const message = JSON.stringify({
      type: MESSAGE_TYPES.ALL_TRANSACTIONS,
      payload: txInfo,
    });

    for (const client of subscribers) {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    }
  });
}

export async function getSpecificPendingTxs(
  address: string,
  subscribers: Set<WebSocket>,
) {
  const normalizedAddress = address.toLowerCase();

  provider.on("pending", async (txHash) => {
    try {
      const tx = await provider.getTransaction(txHash);
      if (!tx || (!tx.to && !tx.from)) return;

      const isRelevantTx =
        tx.from?.toLowerCase() === normalizedAddress ||
        tx.to?.toLowerCase() === normalizedAddress;

      if (!isRelevantTx) return;

      const message = JSON.stringify({
        type: MESSAGE_TYPES.ONE_ADDRESS_TRANSACTION,
        payload: tx,
      });

      for (const client of subscribers) {
        if (client.readyState === client.OPEN) {
          client.send(message);
        }
      }
    } catch (err) {
      console.error("Error processing tx:", err);
    }
  });
}

export async function watchBalance(
  address: string,
  subscribers: Set<WebSocket>,
) {
  let lastBalance: string | null = null;

  provider.on("block", async () => {
    try {
      const balance = await provider.getBalance(address);
      const eth = formatEther(balance);

      for (const client of subscribers) {
        if (eth !== lastBalance && client.readyState === client.OPEN) {
          lastBalance = eth;

          client.send(
            JSON.stringify({
              type: MESSAGE_TYPES.GET_BALANCE,
              address,
              balance: eth,
            }),
          );
        }
      }
    } catch (error) {
      console.error(`Error to get balance${address}:`, error);
    }
  });
}

export async function getFeeData(subscribers: Set<WebSocket>) {
  const now = Date.now();

  if (now - lastSentTime < RATE_LIMIT_MS) return;
  lastSentTime = now;

  const feeData = await provider.getFeeData();

  if (!feeData.gasPrice) return;

  const message = JSON.stringify({
    type: MESSAGE_TYPES.FEE_DATA,
    payload: ethers.formatUnits(feeData.gasPrice, "gwei"),
  });

  for (const client of subscribers) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}
