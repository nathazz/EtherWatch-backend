import { ethers } from "ethers";

export function isValidHash(hash: string): boolean {
  return ethers.isHexString(hash, 32);
}

export function isValidBlock(block: string | number): boolean {
  const isNumber = /^\d+$/.test(String(block));

  const isHash = /^0x([A-Fa-f0-9]{64})$/.test(String(block));

  return isNumber || isHash;
}
