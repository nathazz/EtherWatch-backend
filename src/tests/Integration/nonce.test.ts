import { clientRedis } from "../../server";
import { generateNonce, getAddressByNonce, clearNonce } from "../../utils/nonce";

jest.mock("../../server", () => ({
  clientRedis: { setex: jest.fn(), get: jest.fn(), del: jest.fn() },
}));

jest.mock("ethers", () => ({
  uuidV4: jest.fn((_randomBits?: Uint8Array) => "mocked-uuid"),
}));

describe("Nonce service", () => {
  beforeEach(() => jest.clearAllMocks());

  test("generateNonce stores nonce in Redis", async () => {
    const mockAddress = "0xabc123";
    const nonce = await generateNonce(mockAddress);

    expect(nonce).toBe("mocked-uuid");
    expect(clientRedis.setex).toHaveBeenCalledWith(`nonce:${nonce}`, 300, mockAddress);
  });

  test("getAddressByNonce returns address when found", async () => {
    (clientRedis.get as jest.Mock).mockResolvedValueOnce("0xabc123");
    const result = await getAddressByNonce("mocked-uuid");
    expect(result).toBe("0xabc123");
  });

  test("getAddressByNonce returns null when not found", async () => {
    (clientRedis.get as jest.Mock).mockResolvedValueOnce(null);
    const result = await getAddressByNonce("mocked-uuid");
    expect(result).toBeNull();
  });

  test("clearNonce calls Redis DEL", async () => {
    await clearNonce("mocked-uuid");
    expect(clientRedis.del).toHaveBeenCalledWith("nonce:mocked-uuid");
  });
});
