import { Router } from "express";
import {
  getBalance,
  getBlock,
  getEnsProfile,
  getTransaction,
  health,
} from "../controllers/infos";
import {
  getEthereumInfos,
  getEthereumMarketData,
  getEthereumPrice,
  getFeeData,
} from "../controllers/ethData";
import {
  checkAuth,
  createClientMetaMask,
  createNonce,
  logout,
} from "../controllers/metamaskClient";

const router = Router();

router.get("/health", health);

//client Info
router.get("/tx/:hash", getTransaction);
router.get("/block/:block", getBlock);
router.get("/ens-profile/:address", getEnsProfile);
router.get("/balance/:address", getBalance)

// Eth data
router.get("/eth_price", getEthereumPrice);
router.get("/eth_market", getEthereumMarketData);
router.get("/eth_feeData", getFeeData);
router.get("/eth_infos", getEthereumInfos)

//metamask
router.post("/nonce", createNonce);
router.post("/login", createClientMetaMask);
router.post("/logout", logout);
router.get("/check-auth", checkAuth);

export default router;
