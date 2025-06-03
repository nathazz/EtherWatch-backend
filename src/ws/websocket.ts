import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { validatePendingTransaction } from '../Validator/pedindgTxs';


export function setupWebSocket(server: Server) {

  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected on WebSocket');
    ws.on('error', console.error);

    ws.on('message', async (data) => {
      try {
        const parsed = JSON.parse(data.toString());

        if (parsed.type === 'startTxValidation') {
          const { txHash, expectedSender, expectedReceiver, expectedAmount } = parsed.payload;

          await validatePendingTransaction(
            { txHash, expectedSender, expectedReceiver, expectedAmount },
            (result) => {
              ws.send(JSON.stringify({ type: 'txValidated', payload: result }));
            }
          );
        }
        
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Error in WebSocket server.' }));
      }
    });
  });
}