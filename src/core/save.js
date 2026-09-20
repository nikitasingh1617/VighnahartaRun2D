/* v2 = fresh start: everything saved under the old v1 keys is ignored and wiped */
const KEY = 'vighanharta_save_v2';
const OLD_KEYS = ['vighanharta_save_v1', 'vighanharta_cloud_cache'];

(function wipeOldData() {
  try { OLD_KEYS.forEach(k => localStorage.removeItem(k)); } catch (e) {}
})();

export const save = {
  playerName: '',
  /* Once true the name is permanent — it can never be edited again */
  nameLocked: false,
  /* One-time tutorial shown before the very first run */
  tutorialDone: false,
  unlockedScenes: { night: true, day: false, evening: false },
  bestScores: { night: 0, day: 0, evening: 0 },
  coins: 0,
  ownedOutfits: ['classic'],
  selectedOutfit: 'classic',
  leaderboard: [],
  /* Lifetime stats per player, keyed by lower-case name (shown on the User page) */
  stats: {},
};

/* Stats for one player name (or null if they haven't finished a run yet) */
export function getPlayerStats(name) {
  const key = String(name || '').trim().toLowerCase();
  if (!key) return null;
  return (save.stats && save.stats[key]) || null;
}

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
    /* Older saves have no flag: a stored name means the player already chose one */
    save.nameLocked = typeof p.nameLocked === 'boolean'
      ? p.nameLocked
      : save.playerName.trim().length > 0;
    if (!save.playerName.trim()) save.nameLocked = false;
    if (p.tutorialDone === true) save.tutorialDone = true;
    if (p.unlockedScenes) Object.assign(save.unlockedScenes, p.unlockedScenes);
    if (p.bestScores)     Object.assign(save.bestScores, p.bestScores);
    if (typeof p.coins === 'number') save.coins = p.coins;
    if (Array.isArray(p.ownedOutfits)) save.ownedOutfits = p.ownedOutfits;
    if (typeof p.selectedOutfit === 'string') save.selectedOutfit = p.selectedOutfit;
    if (p.stats && typeof p.stats === 'object' && !Array.isArray(p.stats)) save.stats = p.stats;
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