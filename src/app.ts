import express from 'express'
import { createServer } from 'http'
import { setupWebSocket } from './ws/websocket';

const app = express()
app.use(express.json())

const server = createServer(app);
setupWebSocket(server);


export default app