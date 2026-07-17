import { Client } from "@stomp/stompjs";
import type { YieldGridEvent } from "./types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8083/ws";

export function subscribeToYieldGrid(onEvent: (event: YieldGridEvent) => void) {
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 1_500,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
    onConnect: () => {
      client.subscribe("/topic/events", (message) => {
        onEvent(JSON.parse(message.body) as YieldGridEvent);
      });
    },
  });
  client.activate();
  return () => void client.deactivate();
}
