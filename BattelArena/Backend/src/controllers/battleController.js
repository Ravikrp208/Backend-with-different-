import { store } from "../store/memoryStore.js";
import { BattleEngine } from "../services/battleEngine.js";

export const startBattle = (req, res) => {
  try {
    const { cat1Id, cat2Id } = req.body;
    if (!cat1Id || !cat2Id) {
      return res.status(400).json({ success: false, message: "Both cat1Id and cat2Id are required" });
    }

    const cat1 = store.getCatById(cat1Id);
    const cat2 = store.getCatById(cat2Id);

    if (!cat1 || !cat2) {
      return res.status(404).json({ success: false, message: "One or both Cat Bots were not found" });
    }

    const battle = store.createBattle(cat1, cat2);
    res.status(201).json({
      success: true,
      message: "Battle initiated!",
      data: battle
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const executeBattleTurn = (req, res) => {
  try {
    const { battleId } = req.params;
    const { moveType } = req.body; // 'STANDARD', 'SPECIAL', 'AUTO'

    const battle = BattleEngine.executeTurn(battleId, moveType || "AUTO");
    res.json({
      success: true,
      data: battle
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const simulateFullBattle = (req, res) => {
  try {
    const { cat1Id, cat2Id } = req.body;
    if (!cat1Id || !cat2Id) {
      return res.status(400).json({ success: false, message: "Both cat1Id and cat2Id are required" });
    }

    const battle = BattleEngine.simulateFullBattle(cat1Id, cat2Id);
    res.json({
      success: true,
      message: "Battle simulation complete!",
      data: battle
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBattleById = (req, res) => {
  try {
    const battle = store.getBattle(req.params.id);
    if (!battle) {
      return res.status(404).json({ success: false, message: "Battle not found" });
    }
    res.json({ success: true, data: battle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBattles = (req, res) => {
  try {
    const battles = store.getAllBattles();
    res.json({ success: true, count: battles.length, data: battles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
