import { ethers } from "ethers";

import jwt from "jsonwebtoken";

import type { Request, Response } from "express";
import {
  clearNonce,
  generateNonce,
  getAddressByNonce,
} from "../../utils/nonce";
import {
  AddressBodySchema,
  SignatureBodySchema,
} from "../../validators/metamask.schema";

export async function createNonce(req: Request, res: Response) {
  try {
    const parsed = AddressBodySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { address } = parsed.data;
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
    const parsed = SignatureBodySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { signature, nonce } = parsed.data;

    const address = await getAddressByNonce(nonce);

    if (!address) {
      res.status(400).json({ msg: "Invalid Address!" });
      return;
    }

    const msg = `nonce:${nonce}`;

    const signedMsg = ethers.verifyMessage(msg, signature);
    const recoveredAddress = signedMsg.toLowerCase();

    if (recoveredAddress !== address.toLowerCase()) {
      res.status(401).json({ msg: "Signature invalid!" });
      return;
    }

    await clearNonce(nonce);

    if (!process.env.JWT_SECRET) {
      res.status(400).json("Missing JWT variable");
      return;
    }

    const token = jwt.sign(
      { address: recoveredAddress },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      }
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ msg: "Account validated!" });
  } catch (error) {
    console.error(`Login Error:`, error);
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function checkAuth(req: Request, res: Response) {
  const token = req.cookies.authToken;

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (!process.env.JWT_SECRET) {
    res.status(400).json("Missing JWT variable");
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      address: string;
    };
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
