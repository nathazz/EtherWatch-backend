import type { WebSocket } from "ws";
import { provider } from "../../blockchain/provider";
import { ethers, formatEther } from "ethers";
import { MESSAGE_TYPES } from "../../utils/constants";

const RATE_LIMIT_MS = 3000;
let txPool: any[] = [];
const MAX_POOL_SIZE = 300;

export async function getAllPendingTxs(subscribers: Set<WebSocket>) {
  provider.on("pending", async (txHash) => {
    try {
      const tx = await provider.getTransaction(txHash);
      if (tx) {
        txPool.push(tx);

        if (txPool.length >= MAX_POOL_SIZE) {
          txPool.shift();
        }
        txPool.push(tx);
      }
    } catch (err) {
      console.error("Error to found TX's:", err);
    }
  });

  setInterval(() => {
    if (txPool.length === 0) return;

    const message = JSON.stringify({
      type: MESSAGE_TYPES.ALL_PENDING_TRANSACTIONS,
      txs: txPool,
    });

    for (const client of subscribers) {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    }

    txPool = [];
  }, RATE_LIMIT_MS);
}

export async function watchBalance(
  address: string,
  subscribers: Set<WebSocket>,
) {
  let lastBalance: string | null = null;

  provider.on("block", async () => {
    try {
      const balance = await provider.getBalance(address);
      const transactionCount = await provider.getTransactionCount(address);

      const eth = formatEther(balance);

      for (const client of subscribers) {
        if (eth !== lastBalance && client.readyState === client.OPEN) {
          lastBalance = eth;

          client.send(
            JSON.stringify({
              type: MESSAGE_TYPES.GET_BALANCE,
              address,
              balance: eth,
              txCount: transactionCount,
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
  let lastGasPrice: string | null = null;

  provider.on("block", async () => {
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    const maxFeeGas = feeData.maxFeePerGas;
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

    if (!gasPrice || !maxFeeGas || !maxPriorityFeePerGas) return;

    const gasPriceGwei = ethers.formatUnits(gasPrice, "gwei");
    const maxFeeGwei = ethers.formatUnits(maxFeeGas, "gwei");
    const maxPriorityGwei = ethers.formatUnits(maxPriorityFeePerGas, "gwei");

    const message = JSON.stringify({
      type: MESSAGE_TYPES.FEE_DATA,
      gasPrice: gasPriceGwei,
      maxFeePerGas: maxFeeGwei,
      maxPriorityFeePerGas: maxPriorityGwei,
    });

    for (const client of subscribers) {
      if (client.readyState === client.OPEN && gasPriceGwei !== lastGasPrice) {
        lastGasPrice = gasPriceGwei;

        client.send(message);
      }
    }
  });
}
