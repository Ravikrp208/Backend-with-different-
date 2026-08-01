import { store } from "../store/memoryStore.js";

export const getLeaderboard = (req, res) => {
  try {
    const leaderboard = store.getLeaderboard();
    res.json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
