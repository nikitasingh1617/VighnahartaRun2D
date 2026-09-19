const KEY = 'vighanharta_save_v1';

export const save = {
  playerName: '',
  unlockedScenes: { night: true, day: false, evening: false },
  bestScores: { night: 0, day: 0, evening: 0 },
  coins: 0,
  ownedOutfits: ['classic'],
  selectedOutfit: 'classic',
  leaderboard: [],
};

function migrateLeaderboard() {
  const seen = new Map();
  for (const e of save.leaderboard) {
    const rawScore = Number.isFinite(e.score) && e.score > 0
      ? e.score
      : (Number.isFinite(e.meters) ? e.meters : 0);
    const entry = {
      name: e.name || 'Anonymous',
      score: rawScore,
      seconds: Number.isFinite(e.seconds) ? e.seconds : 0,
      roundsCompleted: Number.isFinite(e.roundsCompleted) ? e.roundsCompleted : 0,
      coinsEarned: Number.isFinite(e.coinsEarned) ? e.coinsEarned : 0,
      scene: e.scene || 'night',
      difficulty: e.difficulty || 'medium',
      date: e.date || new Date().toLocaleDateString()
    };
    const existing = seen.get(entry.name);
    if (!existing || entry.score > existing.score) {
      seen.set(entry.name, entry);
    }
  }
  save.leaderboard = Array.from(seen.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (typeof p.playerName === 'string') save.playerName = p.playerName;
    if (p.unlockedScenes) Object.assign(save.unlockedScenes, p.unlockedScenes);
    if (p.bestScores)     Object.assign(save.bestScores, p.bestScores);
    if (typeof p.coins === 'number') save.coins = p.coins;
    if (Array.isArray(p.ownedOutfits)) save.ownedOutfits = p.ownedOutfits;
    if (typeof p.selectedOutfit === 'string') save.selectedOutfit = p.selectedOutfit;
    if (Array.isArray(p.leaderboard)) {
      save.leaderboard = p.leaderboard;
      migrateLeaderboard();
      persistSave();
    }
  } catch (e) {}
}

export function persistSave() {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {}
}

loadSave();