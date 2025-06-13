import { WebSocket } from "ws";

export const balanceWatchers = new Map<string, Set<WebSocket>>();
export const allTxClients = new Set<WebSocket>();
export const gasFeeClients = new Set<WebSocket>();
export const activeBalanceListeners = new Set<string>();

export function registerClientInSet(
  map: Map<string, Set<WebSocket>>,
  key: string,
  ws: WebSocket,
) {
  if (!map.has(key)) {
    map.set(key, new Set());
  }
  map.get(key)!.add(ws);
}

export function unregisterClient(ws: WebSocket) {
  allTxClients.delete(ws);
  gasFeeClients.delete(ws);

  for (const map of [balanceWatchers]) {
    for (const [key, set] of map.entries()) {
      set.delete(ws);
      if (set.size === 0) {
        map.delete(key);
      }
    }
  }
}
