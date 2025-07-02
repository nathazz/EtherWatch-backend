import { ethers } from "ethers";
import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import {
  setupPendingTxs,
  updateBalances,
  updateFeeData,
} from "./events/ethEvents";
import { provider } from "../blockchain/provider";

let startedPendingListener = false; 

export async function setupSocketIO(server: HTTPServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONT_END_DEV,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  });

  provider.on("block", async () => {
    await updateBalances(io);
    await updateFeeData(io);
  });

  io.on("connection", (socket) => {

    socket.on("subscribePendingTxs", () => {
      if (!startedPendingListener) {
        startedPendingListener = true;
        setupPendingTxs(io); 
      }

      socket.join("allPendingTransactions");
      socket.emit("subscribed", { type: "allPendingTransactions" });
    });

    socket.on("unsubscribePendingTxs", () => {
      socket.leave("allPendingTransactions");
    });

    socket.on("subscribeBalance", (address: string) => {
      if (!ethers.isAddress(address)) {
        socket.emit("error", "Invalid Ethereum address");
        return;
      }

      const room = `balance:${address.toLowerCase()}`;
      socket.join(room);
      socket.emit("subscribed", { type: "balance", address });
    });

    socket.on("unsubscribeBalance", (address: string) => {
      const room = `balance:${address.toLowerCase()}`;
      socket.leave(room);
    });

    socket.on("subscribeFeeData", () => {
      socket.join("feeData");
      socket.emit("subscribed", { type: "feeData" });
    });

    socket.on("unsubscribeFeeData", () => {
      socket.leave("feeData");
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });

  return io;
}
