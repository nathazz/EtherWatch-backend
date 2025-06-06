import { ethers, TransactionResponse } from "ethers";
import { provider } from "../blockchain/provider";
import { IValidateTransactionInput, IValidateTransactionResult } from "../interfaces/validates";

function isTransactionValid(
  tx: TransactionResponse,
  sender: string,
  receiver: string,
  amount: string
): boolean {
  const from = tx.from.toLowerCase();
  const to = tx.to?.toLowerCase();
  const value = ethers.formatEther(tx.value);
  return (
    from === sender &&
    to === receiver &&
    parseFloat(value) >= parseFloat(amount)
  );
}

export async function validatePendingTransaction(
  {
    txHash,
    expectedSender,
    expectedReceiver,
    expectedAmount,
  }: IValidateTransactionInput,
  callback: (result: IValidateTransactionResult) => void,
  timeoutMs = 30000
) {
  const sender = expectedSender.toLowerCase();
  const receiver = expectedReceiver.toLowerCase();

  const handlePendingTx = async () => {
    try {
      const tx = await provider.getTransaction(txHash);
      if (!tx) return;

      if (isTransactionValid(tx, sender, receiver, expectedAmount.toString())) {
        provider.off("pending", handlePendingTx);
        clearTimeout(timer);

        callback({
          valid: true,
          txHash,
          from: tx.from,
          to: tx.to || undefined,
          value: ethers.formatEther(tx.value),
          confirmed: !!tx.blockNumber,
        });
      }
    } catch (err) {
      console.error("Error validating pending transaction:", err);
    }
  };

  provider.on("pending", handlePendingTx);

  const timer = setTimeout(() => {
    provider.off("pending", handlePendingTx);
    callback({
      valid: false,
      txHash: "",
      reason: "Timeout: no valid transaction found!",
    } as IValidateTransactionResult);
  }, timeoutMs);
}