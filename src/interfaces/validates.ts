import { MESSAGE_TYPES } from "../utils/constants";

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];
export interface WebSocketMessage {
  type: MessageType;
  data?: {
    address?: string;
    [key: string]: any;
  };
}
