import { createServer } from "http";
import express from "express";
import "dotenv/config";
import { setupWebSocket } from "./ws/setup";
import dotenv from "dotenv";
import router from "./http/routes/routes";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config({ path: "../.env" });

const app = express();

app.use(
  cors({
    origin: process.env.FRONT_END_DEV,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use("/api", router);

async function start() {
  const server = createServer(app);

  await setupWebSocket(server);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(
      `Server listening on http://localhost:${PORT} + ws://localhost:${PORT}`,
    );
  });
}

start();
