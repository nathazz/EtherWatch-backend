import { z } from "zod/v4";

export const EnsProfileResponseSchema = z.object({
  ens: z.object({
    name: z.string(),
    avatar: z.string().nullable(),
  }),
});
