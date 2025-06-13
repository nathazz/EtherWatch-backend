import { createServer } from "http";
import express from "express";
import "dotenv/config";
import { setupWebSocket } from "./ws/setup";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const app = express();
app.use(express.json());

async function start() {
  const server = createServer(app);

  await setupWebSocket(server);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server listening on wss://localhost:${PORT}`);
  });
}

start();

export default app;
