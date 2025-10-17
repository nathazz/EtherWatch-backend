import { z } from "zod/v4";
import { isValidHash } from "../utils/regex";

export const hashParamsSchema = z.object({
  hash: z.string().refine(isValidHash, { message: "Invalid Hash!" }),
});
