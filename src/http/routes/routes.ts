import { Router } from "express";
import {
  getBlock,
  getEnsProfile,
  getTransaction,
  health,
} from "../controllers/address";

const router = Router();

router.get("/health", health);

router.get("/tx/:hash", getTransaction);
router.get("/block/:block", getBlock);
router.get("/ens-profile/:address", getEnsProfile);

export default router;
