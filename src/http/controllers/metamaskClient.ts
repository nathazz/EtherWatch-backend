import { ethers } from "ethers";

import jwt from "jsonwebtoken";

import type { Request, Response } from "express";
import {
  clearNonce,
  generateNonce,
  getAddressByNonce,
} from "../../utils/nonce";
import { HttpStatusCode } from "axios";

const secret = process.env.JWT_SECRET || "";

export async function createNonce(req: Request, res: Response) {
  try {
    const { address } = req.body;

    if (!address) {
      res.status(400).json({ error: "Address not found!" });
      return;
    }

    const nonce = await generateNonce(address);

    res.status(200).json({ nonce });
  } catch (error) {
    console.error(`CreateNonce Error:`, error);
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function createClientMetaMask(req: Request, res: Response) {
  try {
    const { signature, nonce } = req.body;

    if (!signature || !nonce) {
      res.status(400).json({ error: "Signature and nonce not found!" });
      return;
    }

    const adress = await getAddressByNonce(nonce);
    const msg = `nonce:${nonce}`;

    const signedMsg = ethers.verifyMessage(msg, signature);
    const recoveredAddress = signedMsg.toLowerCase();

    if (recoveredAddress !== adress.toLowerCase()) {
      res
        .status(401)
        .json({ msg: "Unauthorized!", status: HttpStatusCode.Unauthorized });
      return;
    }

    await clearNonce(nonce);

    const token = jwt.sign({ address: recoveredAddress }, secret, {
      expiresIn: "3d",
    });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ msg: "Account validated!", status: HttpStatusCode.Ok });
  } catch (error) {
    console.error(`Login Error:`, error);
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function checkAuth(req: Request, res: Response) {
  const token = req.cookies?.authToken;

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as { address: string };
    res.status(200).json({ address: decoded.address });
  } catch (error) {
    console.error("CheckAuth Error:", error);
    res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });

  res.status(200).json({ msg: "Logged out" });
}
