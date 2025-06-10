import type { RawData, WebSocket } from 'ws';
import { provider } from '../../blockchain/provider';

const RATE_LIMIT_MS = 1000;
let lastSentTime = 0;

export async function HandlerAllTransactions(clients: Set<WebSocket>) {
  provider.on('pending', async (tx) => {
    const now = Date.now();

    if (now - lastSentTime < RATE_LIMIT_MS) return;

    lastSentTime = now;

    const txInfo = await provider.getTransaction(tx);
    const message = JSON.stringify({ type: 'AllTransactions', payload: txInfo });

    for (const client of clients) {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    }
  });
}
