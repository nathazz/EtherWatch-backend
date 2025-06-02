export interface ValidateTransactionInput {
  txHash: string;
  expectedSender: string;
  expectedReceiver: string;
  expectedAmount: string | number;
}

export interface ValidateTransactionResult {
  valid: boolean;
  txHash: string;
  from?: string;
  to?: string;
  value?: string;
  confirmed?: boolean;
  reason?: string;
}