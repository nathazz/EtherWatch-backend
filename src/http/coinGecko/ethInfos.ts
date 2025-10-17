import { Request, Response } from "express";
import axios from "axios";
import { MarketDataSchema, PriceSchema } from "../../validators/ethData.schema";
import {
  EthereumInfoSchema,
} from "../../validators/infos.schema";

export async function getEthereumPrice(req: Request, res: Response) {
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "ethereum",
          vs_currencies: "usd,brl,eur",
        },
        headers: {
          "x-cg-demo-api-key": process.env.COIN_GECKO_KEY,
        },
      },
    );

    const price = data.ethereum;
    const response = {
      price: {
        usd: price.usd,
        brl: price.brl,
        eur: price.eur,
      },
    };

    const parsed = PriceSchema.safeParse(response);
    if (!parsed.success) {
      res.status(500).json({ error: "Invalid price data format" });
      return;
    }

    res.json(parsed.data);
  } catch (error) {
    console.error(`Error fetching ETH price:`, error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getEthereumMarketData(req: Request, res: Response) {
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "ethereum",
          vs_currencies: "usd,brl,eur",
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true,
          include_last_updated_at: true,
        },
        headers: {
          "x-cg-demo-api-key": process.env.COIN_GECKO_KEY,
        },
      },
    );

    const eth = data.ethereum;
    const response = {
      market_data: {
        market_cap: {
          usd: eth.usd_market_cap,
          brl: eth.brl_market_cap,
          eur: eth.eur_market_cap,
        },
        volume_24h: {
          usd: eth.usd_24h_vol,
          brl: eth.brl_24h_vol,
          eur: eth.eur_24h_vol,
        },
        change_24h_percent: {
          usd: eth.usd_24h_change,
          brl: eth.brl_24h_change,
          eur: eth.eur_24h_change,
        },
        last_updated: eth.last_updated_at,
      },
    };

    const parsed = MarketDataSchema.safeParse(response);

    if (!parsed.success) {
      res.status(500).json({ error: "Invalid market data format" });
      return;
    }

    res.json(parsed.data);
  } catch (error) {
    console.error(`Error fetching ETH market data:`, error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}



export async function getEthereumInfos(req: Request, res: Response) {
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/coins/ethereum",
      {
        headers: {
          "x-cg-demo-api-key": process.env.COIN_GECKO_KEY!,
        },
      },
    );

    const ethereumInfo = EthereumInfoSchema.parse(data);

    res.status(200).json(ethereumInfo);
  } catch (error) {
    console.error("Error fetching Ethereum infos:", error);
    res.status(500).json({ error: "Failed to fetch Ethereum info" });
  }
}
