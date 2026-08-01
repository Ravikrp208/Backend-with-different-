# 🐾 AI Cat Bot Battle Arena - Node.js Backend API

An Express.js REST API powering the **AI Cat Bot Battle Arena**. Features AI-driven Cat Bot generation (via Google Gemini API with smart heuristic fallback), turn-based combat engine, interactive fight commentary, dodge & critical hit mechanics, and live leaderboards.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
# Server running at http://localhost:5000
```

---

## 📡 API Endpoints

### 🐱 1. Cat Bots (`/api/cats`)
- **`GET /api/cats`** — Get all registered Cat Bots.
- **`GET /api/cats/:id`** — Get detailed stats for a single Cat Bot.
- **`POST /api/cats`** — Create a custom Cat Bot manually.
  ```json
  {
    "name": "Meowtrino",
    "title": "Cosmic Destroyer",
    "element": "Fire",
    "avatar": "🔥🐱",
    "hp": 130,
    "attack": 30,
    "defense": 16,
    "speed": 24,
    "specialPower": "Supernova Pounce",
    "specialDescription": "Crushes opponent with star power",
    "personality": "Obsessed with lasers and cosmic conquest"
  }
  ```
- **`POST /api/cats/generate-ai`** — Generate an AI Cat Bot via AI prompt.
  ```json
  {
    "prompt": "Cyberpunk Samurai Cat"
  }
  ```

---

### ⚔️ 2. Battle Engine (`/api/battles`)
- **`POST /api/battles/start`** — Initiate a new battle state between 2 Cat Bots.
  ```json
  {
    "cat1Id": "cat_1",
    "cat2Id": "cat_2"
  }
  ```
- **`POST /api/battles/:battleId/turn`** — Execute a single turn (`moveType`: `"STANDARD" | "SPECIAL" | "AUTO"`).
  ```json
  {
    "moveType": "SPECIAL"
  }
  ```
- **`POST /api/battles/simulate`** — Instantly simulate a full battle to completion with AI commentary!
  ```json
  {
    "cat1Id": "cat_1",
    "cat2Id": "cat_3"
  }
  ```
- **`GET /api/battles`** — Get list of all past & active battles.
- **`GET /api/battles/:id`** — Get battle state by ID.

---

### 🏆 3. Leaderboard (`/api/leaderboard`)
- **`GET /api/leaderboard`** — Get ranked list of Cat Bots sorted by Trophies & Wins.

---

## 🛠️ Architecture & Tech Stack
- **Framework**: Express.js (ES Modules)
- **Combat Logic**: Custom speed-based turn battle engine (dodge, crits, element multipliers, knockout detection)
- **AI Integration**: Google Gemini API + Smart fallback generator for offline resilience
- **CORS Support**: Pre-configured for seamless connection with React/Vite Frontend
