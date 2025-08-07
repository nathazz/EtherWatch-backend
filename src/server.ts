import { createServer } from "http";
import express from "express";
import "dotenv/config";
import { setupSocketIO } from "./socket/setupSocket";
import dotenv from "dotenv";
import router from "./http/routes/routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./swagger.json";

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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

async function start() {
  const server = createServer(app);

  await setupSocketIO(server);

  const PORT = process.env.PORT || 3000;

  server.listen(PORT, () => {
    console.log(
      `Server listening on http://localhost:${PORT}/api/health + ws://localhost:${PORT}`,
    );
  });
}

start();
