import { ethers, TransactionResponse } from 'ethers';

export async function isTransactionValid(
  tx: TransactionResponse,
  sender: string,
  receiver: string,
  amount: string,
): Promise<boolean> {
  const from = tx.from.toLowerCase();
  const to = tx.to?.toLowerCase();
  const value = ethers.formatEther(tx.value);

  return from === sender && to === receiver && parseFloat(value) >= parseFloat(amount);
}
