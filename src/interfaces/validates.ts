import { MESSAGE_TYPES } from "../utils/constants";

export interface IValidateTransactionInput {
  txHash: string;
  expectedSender: string;
  expectedReceiver: string;
  expectedAmount: string | number;
}

export interface IValidateTransactionResult {
  valid: boolean;
  txHash: string;
  from?: string;
  to?: string;
  value?: string;
  confirmed?: boolean;
  reason?: string;
}

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];
export interface WebSocketMessage {
  type: MessageType;
  data?: {
    address?: string;
    [key: string]: any;
  };
}
