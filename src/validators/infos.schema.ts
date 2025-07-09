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


export const EthereumInfoSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.object({
    thumb: z.string(),
    small: z.string(),
    large: z.string(),
  }),
  description: z.object({
    en: z.string(),
  }),
  links: z.object({
    homepage: z.array(z.string()),
    blockchain_site: z.array(z.string()),
    official_forum_url: z.array(z.string()),
    chat_url: z.array(z.string()),
    announcement_url: z.array(z.string()),
    twitter_screen_name: z.string(),
    facebook_username: z.string(),
    subreddit_url: z.string(),
    repos_url: z.object({
      github: z.array(z.string()),
      bitbucket: z.array(z.string()),
    }),
  }),
  hashing_algorithm: z.string(),
  genesis_date: z.string(),
  market_cap_rank: z.number(),
  categories: z.array(z.string()),
  public_notice: z.string().nullable(),
  market_data: z.object({
    current_price: z.record(z.string(), z.number()),
    market_cap: z.record(z.string(), z.number()),
    total_volume: z.record(z.string(), z.number()),
    high_24h: z.record(z.string(), z.number()),
    low_24h: z.record(z.string(), z.number()),
    price_change_percentage_24h: z.number(),
    market_cap_change_percentage_24h: z.number(),
  }),
});


export type EthereumInfo = z.infer<typeof EthereumInfoSchema>;
