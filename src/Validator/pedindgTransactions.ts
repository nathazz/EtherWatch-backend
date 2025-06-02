import { ethers, TransactionResponse } from "ethers";
import { provider } from "../blockchain/provider";
import { ValidateTransactionInput, ValidateTransactionResult } from "../interfaces/validate";

export function validateTransaction(
  {
    expectedSender,
    expectedReceiver,
    expectedAmount,
  }: ValidateTransactionInput,
  callback: (result: ValidateTransactionResult) => void,
  timeoutMs = 30000 
) {
  const lowerSender = expectedSender.toLowerCase();
  const lowerReceiver = expectedReceiver.toLowerCase();

  const onTx = async (txHash: string) => {
    try {
      const tx: TransactionResponse | null = await provider.getTransaction(txHash);
      if (!tx) return;

      const from = tx.from.toLowerCase();
      const to = tx.to?.toLowerCase();
      const value = ethers.formatEther(tx.value);

      const isValid =
        from === lowerSender &&
        to === lowerReceiver &&
        parseFloat(value) >= parseFloat(expectedAmount.toString());

      if (isValid) {
        provider.off("pending", onTx);

        clearTimeout(timer);

        callback({
          valid: true,
          txHash,
          from,
          to,
          value,
          confirmed: !!tx.blockNumber,
        });
      }
    } catch (err) {
      console.error("Error to validate pending transaction:", err);
    }
  };

  provider.on("pending", onTx);

  const timer = setTimeout(() => {
    provider.off("pending", onTx);
    callback({
      valid: false,
      txHash: "",
      reason: "Timeout: nothing transaction valid!",
    } as ValidateTransactionResult);
  }, timeoutMs);
}
