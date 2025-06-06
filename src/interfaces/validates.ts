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