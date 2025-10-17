import { Router } from "express";
import { getBalance, getBlock, getEnsProfile, getFeeData, getTransaction } from "../ethereumNetwork/ethDatas";
import { getEthereumInfos, getEthereumMarketData, getEthereumPrice } from "../coinGecko/ethInfos";
import { checkAuth, createClientMetaMask, createNonce, logout } from "../metamask/metamaskClient";
import { health } from "../health/health";



const router = Router();

router.get("/health", health);

//client Info
router.get("/tx/:hash", getTransaction);
router.get("/block/:block", getBlock);
router.get("/ens-profile/:address", getEnsProfile);
router.get("/balance/:address", getBalance);

// Eth data
router.get("/eth_price", getEthereumPrice);
router.get("/eth_market", getEthereumMarketData);
router.get("/eth_feeData", getFeeData);
router.get("/eth_infos", getEthereumInfos);

//metamask
router.post("/nonce", createNonce);
router.post("/login", createClientMetaMask);
router.post("/logout", logout);
router.get("/check-auth", checkAuth);

export default router;
