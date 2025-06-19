import { Router } from "express";
import {
  getBlock,
  getEnsProfile,
  getTransaction,
  health,
} from "../controllers/clientInfos";
import {
  getEthereumMarketData,
  getEthereumPrice,
} from "../controllers/ethData";

const router = Router();

router.get("/health", health);

//client Info
router.get("/tx/:hash", getTransaction);
router.get("/block/:block", getBlock);
router.get("/ens-profile/:address", getEnsProfile);

// Eth data
router.get("/eth_price", getEthereumPrice);
router.get("/eth_market", getEthereumMarketData);

export default router;
