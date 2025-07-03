import { ethers, TransactionResponse } from "ethers";
import type { Request, Response } from "express";
import { httpProvider } from "../../blockchain/provider";
import { EnsProfileResponseSchema } from "../../validators/ens.schema";
import { EthereumAddressSchema } from "../../validators/socket.schema";
import { BlockParamsSchema } from "../../validators/block.schema";
import { hashParamsSchema } from "../../validators/transactions.schema";

export function health(req: Request, res: Response) {
  res.status(200).json({ status: "OK" });
}

export async function getTransaction(req: Request, res: Response) {
  try {
    const { hash } = req.params;
    const parsedHash = hashParamsSchema.safeParse({ hash });

    if (!parsedHash.success) {
      res.status(400).json({ error: "Invalid tx hash!" });
      return;
    }

    const tx = await httpProvider.getTransaction(hash);

    if (!tx) {
      res.status(404).json({ error: "Transaction not found!" });
      return;
    }

    res.status(200).json({ tx });
  } catch (error) {
    console.error(`Get Transaction Error:`, error);
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function getBlock(req: Request, res: Response) {
  try {
    const parsedParams = BlockParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      res.status(400).json({ error: "Invalid Block!" });
      return;
    }

    const blockParam = /^\d+$/.test(parsedParams.data.block)
      ? parseInt(parsedParams.data.block)
      : parsedParams.data.block;

    const blockData = await httpProvider.getBlock(blockParam);

    if (!blockData) {
      res.status(404).json({ error: "Block Not Found!" });
      return;
    }

    res.status(200).json({ block: blockData });
  } catch (error) {
    console.error(`Block Error:`, error);
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function getEnsProfile(req: Request, res: Response) {
  try {
    const { address } = req.params;

    const parsedAddress = EthereumAddressSchema.safeParse(address);

    if (!parsedAddress.success) {
      res.status(400).json({ error: "Invalid Ethereum address." });
      return;
    }

    const checksumAddress = ethers.getAddress(address);

    const ensName = await httpProvider.lookupAddress(checksumAddress);
    const avatar = ensName ? await httpProvider.getAvatar(ensName) : null;

    if (!ensName) {
      res.status(404).json({ error: "ENS name not found for this address." });
      return;
    }

    const response = {
      ens: {
        name: ensName,
        avatar,
      },
    };

    if (!response) {
      res.status(404).json({ error: "Invalid ENS profile format" });
      return;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error(`Error resolving ENS:`, error);
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
