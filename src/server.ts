import { createServer } from "http";
import app from "./app";
import "dotenv/config";
import { setupWebSocket } from "./ws/setup";
import dotenv from "dotenv";
import { connectDB } from "./db/mongoDB";

dotenv.config({ path: "../.env" });

async function start() {
  await connectDB();

  const server = createServer(app);

  await setupWebSocket(server);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start();
