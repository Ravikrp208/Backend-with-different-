import app from "./src/app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ======================================================
  🐾 AI CAT BOT BATTLE ARENA BACKEND SERVER STARTED 🐾
  ======================================================
  🚀 Server running on: http://localhost:${PORT}
  🎯 API Status Check: http://localhost:${PORT}/api
  🐱 Cat Bots Endpoint: http://localhost:${PORT}/api/cats
  ⚔️ Battle Endpoint: http://localhost:${PORT}/api/battles
  🏆 Leaderboard Endpoint: http://localhost:${PORT}/api/leaderboard
  ======================================================
  `);
});