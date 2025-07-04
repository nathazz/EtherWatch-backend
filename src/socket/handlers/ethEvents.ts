import { Server } from "socket.io";
import { provider } from "../../blockchain/provider";
import { ethers, formatEther } from "ethers";
import { MESSAGE_TYPES } from "../../utils/constants";
import {
  BalanceResponseSchema,
} from "../../validators/socket.schema";
import { TxsResponseSchema } from "../../validators/transactions.schema";

let txPool: any[] = [];
const MAX_POOL_SIZE = 300;
let lastGasPrice: string | null = null;
const balanceCache = new Map<string, string>();
const queue: string[] = [];
const MAX_QUEUE_SIZE = 10000;

export function setupPendingTxs(io: Server) {
  provider.removeAllListeners("pending");

  provider.on("pending", (txHash) => {
    if (queue.length < MAX_QUEUE_SIZE) {
      queue.push(txHash);
    }
  });

  setInterval(async () => {
    if (queue.length === 0) return;

    const txHash = queue.shift();
    if (!txHash) return;

    try {
      const tx = await provider.getTransaction(txHash);
      if (tx) {
        if (txPool.length >= MAX_POOL_SIZE) txPool.shift();
        txPool.push(tx);
      }
    } catch (error) {
      console.error("Error fetching pending tx:", error);
    }
  }, 100);
  setInterval(() => {
    if (txPool.length === 0) return;

    const data = { txs: txPool };
    const parsed = TxsResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error("Invalid pending txs data:", parsed.error);
      txPool = [];
      return;
    }

    io.to("allPendingTransactions").emit(
      "getAllPendingTransactions",
      parsed.data,
    );

    txPool = [];
  }, 3000);
}

export async function updateBalances(io: Server) {
  for (const room of io.sockets.adapter.rooms.keys()) {
    if (!room.startsWith("balance:")) continue;

    const address = room.replace("balance:", "");
    try {
      const balance = await provider.getBalance(address);
      const txCount = await provider.getTransactionCount(address);
      const eth = parseFloat(formatEther(balance)).toFixed(6);

      const data = { address, balance: eth, txCount };
      const parsed = BalanceResponseSchema.safeParse(data);

      if (parsed.error) return;

      const lastBalance = balanceCache.get(address);

      if (eth !== lastBalance) {
        balanceCache.set(address, eth);

        io.to(room).emit(MESSAGE_TYPES.GET_BALANCE, {
          address,
          balance: eth,
          txCount,
        });
      }
    } catch (error) {
      console.error(`Error fetching balance for ${address}:`, error);
    }
  }
}
