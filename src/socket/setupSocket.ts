import { ethers } from "ethers";
import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import { z } from "zod";
import { setupPendingTxs } from "./handlers/ethEvents";
import { EthereumAddressSchema } from "../validators/infos.schema";

export interface ClientSubscriptions {
  txs: boolean;
}

export async function setupSocketIO(server: HTTPServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONT_END_DEV || "*",
      methods: ["GET", "POST"],
    },
  });

  const clientSubs = new Map<string, ClientSubscriptions>();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    clientSubs.set(socket.id, { txs: false });

    socket.on("subscribePendingTxs", () => {
      clientSubs.get(socket.id)!.txs = true;
    });

    socket.on("unsubscribePendingTxs", () => {
      clientSubs.get(socket.id)!.txs = false;
    });

    socket.on("disconnect", () => {
      clientSubs.delete(socket.id);
      console.log("Client disconnected:", socket.id);
    });
  });

  setupPendingTxs(io, clientSubs);

  return io;
}
