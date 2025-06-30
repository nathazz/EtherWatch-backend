import { randomBytes } from "crypto";
import { uuidV4 } from "ethers";

let storage: { [nonce: string]: string } = {};

export async function generateNonce(address: string) {
  const nonce = uuidV4(randomBytes(16));

  storage[nonce] = address;

  return nonce;
}

export async function getAddressByNonce(nonce: string) {
  return storage[nonce];
}

export async function clearNonce(nonce: string) {
  delete storage[nonce];
}
