import supertest from "supertest";
import app from "../../server";

type TestHashes = Record<"valid" | "invalid", string>;
type TestBlocks = Record<"valid" | "invalid", string>;
type TestAddress = Record<"valid" | "invalid", string>;

const txHash: TestHashes = {
  valid: "0x5dc5c0666cf8b4c60cc4bc8816d4081a18b4fd04be051cb1f1bbdb7a4f6170fd",
  invalid: "0x5dc5c0666cf8b4c60cc4bc8816d4081a18b4fd04be051cb1f1bbwewe12",
};

const block: TestBlocks = {
  valid: "23668703",
  invalid: "236AB",
};

const address: TestAddress = {
  valid: "0x640Ac467fD8D1b1a9dFB37bCC1722e4fBD6AAE5D",
  invalid: "0x640Ac467fD8D1b1a9dFB37bCc1732e5fBD6AAE5D",
};

describe("-- Ethereum Data Endpoints --", () => {
  test("GET /fee-data → should return fee data", async () => {
    const response = await supertest(app).get("/api/eth_feeData");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("gasPrice");
    expect(response.body).toHaveProperty("maxFeePerGas");
    expect(response.body).toHaveProperty("maxPriorityFeePerGas");
  });

  test("GET /tx/:hash → valid transaction", async () => {
    const response = await supertest(app).get(`/api/tx/${txHash.valid}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.tx.hash).toBe(txHash.valid);
  });

  test("GET /tx/:hash → invalid hash", async () => {
    const response = await supertest(app).get(`/api/tx/${txHash.invalid}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toMatch(/Invalid tx hash/i);
  });

  test("GET /block/:block → valid block", async () => {
    const response = await supertest(app).get(`/api/block/${block.valid}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.block.number).toBe(23668703);
  });

  test("GET /block/:block → invalid block param", async () => {
    const response = await supertest(app).get(`/api/block/${block.invalid}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toMatch(/Invalid Block/i);
  });

  test("GET /ens-profile/:address → valid ENS", async () => {
    const response = await supertest(app).get(
      `/api/ens-profile/${address.valid}`
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.ens.name).toBe("dog.eth");
    expect(response.body.ens.avatar).toBe("https://gateway.ipfs.io/ipfs/QmNyAW8nEFQqk3F75mhhgURJYJk6ogqhuuiLfGsTS5nZSK");
  });

  test("GET /ens-profile/:address → not found ENS", async () => {
    const response = await supertest(app).get(
      `/api/ens-profile/${address.invalid}`
    );
    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("GET /balance/:address → valid address", async () => {
    const response = await supertest(app).get(`/api/balance/${address.valid}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("balance");
    expect(response.body).toHaveProperty("txCount");
  });

  test("GET /balance/:address → invalid address", async () => {
    const response = await supertest(app).get(
      `/api/balance/${address.invalid}`
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toMatch(/Invalid Ethereum address/i);
  });
});
