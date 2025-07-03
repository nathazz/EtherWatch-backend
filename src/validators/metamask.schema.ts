import { z } from "zod/v4";

export const AddressBodySchema = z.object({
  address: z.string().min(1, "Address is required"),
});

export const SignatureBodySchema = z.object({
  signature: z.string().min(1, "Signature is required"),
  nonce: z.string().min(1, "Nonce is required"),
});
