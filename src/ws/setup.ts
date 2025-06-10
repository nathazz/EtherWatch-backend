import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { HandlerAllTransactions } from './handlers/allTransactions';

const clients = new Set<WebSocket>();
const allTransactionsSubscribers = new Set<WebSocket>();

let isProviderListening = false;

export async function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.send(JSON.stringify({ type: 'connected' }));

    let isAlive = true;

    const interval = setInterval(() => {
      if (!isAlive) {
        clearInterval(interval);
        ws.terminate();
        clients.delete(ws);
        allTransactionsSubscribers.delete(ws);
        return;
      }

      isAlive = false;
      ws.ping();
    }, 15000);

    ws.on('pong', () => {
      isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'allTransactions') {
          allTransactionsSubscribers.add(ws);

          if (!isProviderListening) {
            HandlerAllTransactions(clients);
            isProviderListening = true;
          }
        }
      } catch (err) {
        ws.send(JSON.stringify({ error: `Invalid message received:${data}` }));
      }
    });

    ws.on('close', () => {
      clearInterval(interval);
      clients.delete(ws);
      allTransactionsSubscribers.delete(ws);
    });

    ws.on('error', (err) => {
      ws.send(JSON.stringify({ error: `WebSocket error:${err}` }));
      clients.delete(ws);
      allTransactionsSubscribers.delete(ws);
    });
  });
}
