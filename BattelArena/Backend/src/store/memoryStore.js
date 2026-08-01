import { INITIAL_CATS } from "../data/initialCats.js";

class MemoryStore {
  constructor() {
    this.cats = [...INITIAL_CATS];
    this.battles = [];
    this.activeBattles = new Map();
  }

  // Cat operations
  getAllCats() {
    return this.cats;
  }

  getCatById(id) {
    return this.cats.find((c) => c.id === id);
  }

  addCat(cat) {
    const newCat = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cat.name || "Unknown AI Kitty",
      title: cat.title || "Rookie Battler",
      element: cat.element || "Fire",
      avatar: cat.avatar || "🐾🐱",
      hp: cat.hp || 100,
      maxHp: cat.hp || 100,
      attack: cat.attack || 20,
      defense: cat.defense || 15,
      speed: cat.speed || 20,
      specialPower: cat.specialPower || "Scratch Blast",
      specialDescription: cat.specialDescription || "Deals power attack",
      personality: cat.personality || "Energetic battle kitten",
      level: 1,
      wins: 0,
      losses: 0,
      trophies: 1000,
      createdAt: new Date().toISOString()
    };
    this.cats.push(newCat);
    return newCat;
  }

  updateCatStats(id, updates) {
    const catIndex = this.cats.findIndex((c) => c.id === id);
    if (catIndex !== -1) {
      this.cats[catIndex] = { ...this.cats[catIndex], ...updates };
      return this.cats[catIndex];
    }
    return null;
  }

  // Battle operations
  createBattle(cat1, cat2) {
    const battleId = `battle_${Date.now()}`;
    const battle = {
      id: battleId,
      cat1: { ...cat1, currentHp: cat1.hp, shield: 0 },
      cat2: { ...cat2, currentHp: cat2.hp, shield: 0 },
      currentTurn: 1,
      status: "IN_PROGRESS", // IN_PROGRESS, COMPLETED
      winnerId: null,
      turnHistory: [],
      commentary: [`🥊 BATTLE STARTED: ${cat1.name} vs ${cat2.name}! Let the claw-shredding begin!`],
      createdAt: new Date().toISOString()
    };

    this.activeBattles.set(battleId, battle);
    return battle;
  }

  getBattle(battleId) {
    return this.activeBattles.get(battleId) || this.battles.find((b) => b.id === battleId);
  }

  saveCompletedBattle(battle) {
    battle.status = "COMPLETED";
    battle.completedAt = new Date().toISOString();
    this.battles.unshift(battle);
    this.activeBattles.delete(battle.id);
  }

  getAllBattles() {
    return [...Array.from(this.activeBattles.values()), ...this.battles];
  }

  // Leaderboard operations
  getLeaderboard() {
    return [...this.cats].sort((a, b) => b.trophies - a.trophies || b.wins - a.wins);
  }
}

export const store = new MemoryStore();
