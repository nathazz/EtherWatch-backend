import { randomBytes } from "crypto";
import { uuidV4 } from "ethers";
import { clientRedis } from "../server";

export async function generateNonce(address: string) {
  const nonce = uuidV4(randomBytes(16));
  await clientRedis.setex(`nonce:${nonce}`, 300, address);

  return nonce;
}

export async function getAddressByNonce(nonce: string) {
  const address = await clientRedis.get(`nonce:${nonce}`);
  return address ? address.toString() : null;
}

export async function clearNonce(nonce: string) {
  await clientRedis.del(`nonce:${nonce}`);
}
