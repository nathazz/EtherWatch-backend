import { z } from "zod/v4";

export const PriceSchema = z.object({
  price: z.object({
    usd: z.number(),
    brl: z.number(),
    eur: z.number(),
  }),
});

export const MarketDataSchema = z.object({
  market_data: z.object({
    market_cap: z.object({
      usd: z.number(),
      brl: z.number(),
      eur: z.number(),
    }),
    volume_24h: z.object({
      usd: z.number(),
      brl: z.number(),
      eur: z.number(),
    }),
    change_24h_percent: z.object({
      usd: z.number(),
      brl: z.number(),
      eur: z.number(),
    }),
    last_updated: z.number(),
  }),
});
