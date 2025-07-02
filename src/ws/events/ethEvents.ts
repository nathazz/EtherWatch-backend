import { Server } from "socket.io";
import { provider } from "../../blockchain/provider";
import { ethers, formatEther } from "ethers";
import { MESSAGE_TYPES } from "../../utils/constants";

let txPool: any[] = [];
const MAX_POOL_SIZE = 300;
let lastGasPrice: string | null = null;
const balanceCache = new Map<string, string>();

export function setupPendingTxs(io: Server) {
  provider.on("pending", async (txHash) => {
    try {
      const tx = await provider.getTransaction(txHash);

      if (tx) {
        if (txPool.length >= MAX_POOL_SIZE) txPool.shift();
        txPool.push(tx);
      }
      
    } catch (error) {
      console.error("Error fetching pending tx:", error);
    }
  });

  setInterval(() => {
    if (txPool.length === 0) return;
    io.to("allPendingTransactions").emit(
      MESSAGE_TYPES.ALL_PENDING_TRANSACTIONS,
      {
        txs: txPool,
      },
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
      const eth = formatEther(balance);

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

export async function updateFeeData(io: Server) {
  try {
    const feeData = await provider.getFeeData();
    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = feeData;

    if (!gasPrice || !maxFeePerGas || !maxPriorityFeePerGas) return;

    const gasPriceGwei = ethers.formatUnits(gasPrice, "gwei");

    if (gasPriceGwei !== lastGasPrice) {
      lastGasPrice = gasPriceGwei;

      io.to("feeData").emit(MESSAGE_TYPES.FEE_DATA, {
        gasPrice: gasPriceGwei,
        maxFeePerGas: ethers.formatUnits(maxFeePerGas, "gwei"),
        maxPriorityFeePerGas: ethers.formatUnits(maxPriorityFeePerGas, "gwei"),
      });
    }
  } catch (error) {
    console.error("Error fetching fee data:", error);
  }
}
