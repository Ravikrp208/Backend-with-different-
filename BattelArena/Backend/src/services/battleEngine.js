import { store } from "../store/memoryStore.js";
import { AIService } from "./aiService.js";

export class BattleEngine {
  /**
   * Calculate combat outcome between attacker and defender for a single turn
   */
  static calculateDamage(attacker, defender, moveType = "STANDARD") {
    const isSpecial = moveType === "SPECIAL";

    // Base damage formula
    let baseDamage = isSpecial ? attacker.attack * 1.5 : attacker.attack;

    // Defense reduction
    const netDefense = Math.max(1, defender.defense * 0.4);
    let damage = Math.round((baseDamage * 10) / netDefense + Math.random() * 4);

    // Speed-based dodge chance
    const speedRatio = defender.speed / (attacker.speed + defender.speed);
    const isDodged = Math.random() < speedRatio * 0.25;

    if (isDodged) {
      return { damage: 0, isDodged: true, isCritical: false, isSpecial };
    }

    // Critical hit chance (15% base + speed bonus)
    const critChance = 0.15 + attacker.speed * 0.005;
    const isCritical = Math.random() < critChance;

    if (isCritical) {
      damage = Math.round(damage * 1.6);
    }

    return { damage: Math.max(5, damage), isDodged: false, isCritical, isSpecial };
  }

  /**
   * Execute 1 turn in an active battle
   */
  static executeTurn(battleId, moveType = "AUTO") {
    const battle = store.getBattle(battleId);
    if (!battle) {
      throw new Error("Battle not found or already finished.");
    }

    if (battle.status === "COMPLETED") {
      return battle;
    }

    // Determine who attacks who this turn
    const isCat1Turn = battle.currentTurn % 2 !== 0;
    const attacker = isCat1Turn ? battle.cat1 : battle.cat2;
    const defender = isCat1Turn ? battle.cat2 : battle.cat1;

    // Choose move
    let actualMoveType = moveType;
    if (moveType === "AUTO") {
      // 30% chance to use special power if turn >= 2
      actualMoveType = battle.currentTurn >= 2 && Math.random() < 0.35 ? "SPECIAL" : "STANDARD";
    }

    const moveName = actualMoveType === "SPECIAL" ? attacker.specialPower : "Scratch Attack";
    const result = this.calculateDamage(attacker, defender, actualMoveType);

    if (result.isDodged) {
      battle.commentary.push(
        `💨 DODGE! ${defender.name} used high speed to dodge ${attacker.name}'s ${moveName} completely!`
      );
    } else {
      defender.currentHp = Math.max(0, defender.currentHp - result.damage);
      const isDefeated = defender.currentHp <= 0;

      const comment = AIService.generateCommentary(
        attacker,
        defender,
        moveName,
        result.damage,
        result.isCritical,
        result.isSpecial,
        isDefeated
      );
      battle.commentary.push(comment);

      if (isDefeated) {
        battle.status = "COMPLETED";
        battle.winnerId = attacker.id;

        // Update stats in persistent store
        const winnerOriginal = store.getCatById(attacker.id);
        const loserOriginal = store.getCatById(defender.id);

        if (winnerOriginal) {
          store.updateCatStats(attacker.id, {
            wins: winnerOriginal.wins + 1,
            trophies: winnerOriginal.trophies + 25,
            level: Math.floor((winnerOriginal.wins + 1) / 3) + 1
          });
        }
        if (loserOriginal) {
          store.updateCatStats(defender.id, {
            losses: loserOriginal.losses + 1,
            trophies: Math.max(0, loserOriginal.trophies - 15)
          });
        }

        store.saveCompletedBattle(battle);
        return battle;
      }
    }

    battle.currentTurn += 1;
    return battle;
  }

  /**
   * Auto simulate full battle until victory
   */
  static simulateFullBattle(cat1Id, cat2Id) {
    const cat1 = store.getCatById(cat1Id);
    const cat2 = store.getCatById(cat2Id);

    if (!cat1 || !cat2) {
      throw new Error("One or both Cat Bots not found.");
    }

    if (cat1.id === cat2.id) {
      throw new Error("A Cat Bot cannot battle against itself!");
    }

    const battle = store.createBattle(cat1, cat2);

    let turnsCount = 0;
    const MAX_TURNS = 20;

    while (battle.status === "IN_PROGRESS" && turnsCount < MAX_TURNS) {
      this.executeTurn(battle.id, "AUTO");
      turnsCount++;
    }

    // Force draw/resolution if reached turn limit
    if (battle.status === "IN_PROGRESS") {
      battle.status = "COMPLETED";
      const winner = battle.cat1.currentHp >= battle.cat2.currentHp ? battle.cat1 : battle.cat2;
      battle.winnerId = winner.id;
      battle.commentary.push(`⏱️ TIME EXPIRED! ${winner.name} wins by higher remaining HP!`);
      store.saveCompletedBattle(battle);
    }

    return battle;
  }
}
