import { createServer } from "http";
import app from "./app";
import "dotenv/config";
import { setupWebSocket } from "./ws/websocket";
import dotenv from "dotenv";
import { connectDB } from "./db/mongoDB";

async function start() {
    dotenv.config({
    path: "../.env"
})

const server = createServer(app);
await setupWebSocket(server);
await connectDB()

app.listen(process.env.PORT, () => {
    console.log('working!');
})
}

start();