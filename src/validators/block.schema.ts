import { z } from "zod/v4";
import { isValidBlock } from "../utils/validates";

export const BlockParamsSchema = z.object({
  block: z.string().refine(isValidBlock, { message: "Invalid block!" }),
});