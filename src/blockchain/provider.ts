import { ethers } from "ethers";

export const provider = new ethers.WebSocketProvider(`wss://mainnet.infura.io/ws/v3/${process.env.INFURA_KEY}`)
