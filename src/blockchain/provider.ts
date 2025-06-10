import { ethers } from 'ethers';

export const provider = new ethers.WebSocketProvider(
  `wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY} `,
);
