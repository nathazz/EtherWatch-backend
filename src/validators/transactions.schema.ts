import { z } from "zod/v4";
import { isValidHash } from "../utils/validates";

export const hashParamsSchema = z.object({
  hash: z.string().refine(isValidHash, { message: "Invalid Hash!" }),
});

const SignatureSchema = z.object({
  _type: z.string().optional(),
  networkV: z.number().nullable(),
  r: z.string(),
  s: z.string(),
  v: z.number(),
});

export const TransactionSchema = z.object({
  _type: z.string().optional(),
  accessList: z.any().nullable(),
  blockNumber: z.number().nullable(),
  blockHash: z.string().nullable(),
  blobVersionedHashes: z.any().nullable(),
  chainId: z.number().nullable(),
  data: z.string(),
  from: z.string(),
  gasLimit: z.string(),
  gasPrice: z.string().nullable(),
  hash: z.string(),
  maxFeePerGas: z.string().nullable(),
  maxPriorityFeePerGas: z.string().nullable(),
  maxFeePerBlobGas: z.any().nullable(),
  nonce: z.number(),
  signature: SignatureSchema,
  to: z.string().nullable(),
  index: z.number(),
  type: z.number(),
  value: z.string(),
});

export const TxsResponseSchema = z.object({
  txs: z.array(TransactionSchema),
});
