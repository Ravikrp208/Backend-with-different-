import { Router } from "express";
import {
  startBattle,
  executeBattleTurn,
  simulateFullBattle,
  getBattleById,
  getAllBattles
} from "../controllers/battleController.js";

const router = Router();

router.get("/", getAllBattles);
router.get("/:id", getBattleById);
router.post("/start", startBattle);
router.post("/:battleId/turn", executeBattleTurn);
router.post("/simulate", simulateFullBattle);

export default router;
