import { ethers } from "ethers";
import type { Request, Response } from "express";
import { httpProvider } from "../../blockchain/provider";
import { isValidBlock, isValidHash } from "../../utils/validates";

export function health(req: Request, res: Response) {
  res.status(200).json({ status: "OK" });
}

export async function getTransaction(req: Request, res: Response) {
  try {
    const { hash } = req.params;

    if (!hash || !isValidHash(hash)) {
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
    const { block } = req.params;

    if (!block || !isValidBlock(block)) {
      res.status(400).json({ error: "Invalid block!" });
      return;
    }

    const blockParam = /^\d+$/.test(block) ? parseInt(block) : block;

    const blockData = await httpProvider.getBlock(blockParam);

    if (!blockData) {
      res.status(404).json({ error: "Block not found!" });
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

    if (!address || !ethers.isAddress(address)) {
      res.status(400).json({ error: "Invalid address!" });
      return;
    }

    const checksumAddress = ethers.getAddress(address);

    const ensName = await httpProvider.lookupAddress(checksumAddress);
    const avatar = ensName ? await httpProvider.getAvatar(ensName) : null;

    if (!ensName) {
      res.status(404).json({ error: "ENS name not found for this address." });
      return;
    }

    res.status(200).json({
      ens: {
        name: ensName,
        avatar: avatar,
      },
    });
  } catch (error) {
    console.error(`Error resolving ENS:`, error);
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
