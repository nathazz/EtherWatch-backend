import { ethers } from "ethers";
import { z } from "zod/v4";

export const EthereumAddressSchema = z.string().refine(ethers.isAddress, {
  message: "Invalid Ethereum address",
});

export const FeeDataResponseSchema = z.object({
  gasPrice: z.string(),
  maxFeePerGas: z.string(),
  maxPriorityFeePerGas: z.string(),
});

export const BalanceResponseSchema = z.object({
  address: z.string(),
  balance: z.string(),
  txCount: z.number(),
});
