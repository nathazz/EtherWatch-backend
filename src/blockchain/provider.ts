import { ethers } from "ethers";

export const provider = new ethers.WebSocketProvider(
  `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_KEY} `,
);

export const httpProvider = new ethers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
);
