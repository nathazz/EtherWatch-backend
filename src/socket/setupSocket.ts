import { ethers } from "ethers";
import { Server as HTTPServer } from "http";
import { Server } from "socket.io";

import { provider } from "../blockchain/provider";
import { setupPendingTxs, updateBalances } from "./handlers/ethEvents";

export async function setupSocketIO(server: HTTPServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONT_END_DEV || "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  });

  provider.on("block", async () => {
    try {
      await updateBalances(io);
    } catch (error) {
      console.error("Error on block handler:", error);
    }
  });

  io.on("connection", (socket) => {
    console.log("client connected", socket.id);

    socket.on("subscribePendingTxs", () => {
      provider.listenerCount("pending").then((listenerCount: number) => {
        if (listenerCount === 0) {
          setupPendingTxs(io);
        }
      });

      socket.join("allPendingTransactions");
      socket.emit("subscribed", { type: "allPendingTransactions" });
    });

    socket.on("unsubscribePendingTxs", () => {
      socket.leave("allPendingTransactions");
    });

    socket.on("subscribeBalance", (address: string) => {
      if (!ethers.isAddress(address)) {
        socket.emit("validation_error", "Invalid Ethereum address");
        return;
      }

      const room = `balance:${address.toLowerCase()}`;
      socket.join(room);
      socket.emit("subscribed", { type: "balance", address });
    });

    socket.on("unsubscribeBalance", async (address: string) => {
      const room = `balance:${address.toLowerCase()}`;
      socket.leave(room);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}
