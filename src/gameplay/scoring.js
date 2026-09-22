import { state, camera } from '../core/state.js';
import { save, persistSave } from '../core/save.js';
import { SCENES, SCENE_ORDER } from '../data/scenes.js';
import { playVictory, playSceneUnlock } from '../core/audio.js';
import { submitRun } from '../cloud.js';

function freezeStats() {
  state.finalRunTime = Math.max(0, camera.time - (state.runStartTime || 0));
  state.finalRunDistance = state.runDistance || 0;
  state.finalRunCoins = state.runCoins || 0;
  state.score = Math.round(state.finalRunDistance / 10);
}

function buildRecord() {
  return {
    name: save.playerName || 'Anonymous',
    difficulty: state.difficulty || 'medium',
    rounds: state.delivered || 0,
    time: Math.round(state.finalRunTime),
    coinsHeld: save.coins,
    date: new Date().toLocaleDateString()
  };
}

/* Lifetime stats for the User page (kept per player name, on this device) */
function recordRunStats(won) {
  const name = (save.playerName || '').trim();
  if (!name) return;
  if (!save.stats) save.stats = {};
  const key = name.toLowerCase();
  const s = save.stats[key] || (save.stats[key] = {
    name, runs: 0, wins: 0, delivered: 0, distance: 0, coins: 0, seconds: 0,
    lastPlayed: 0, best: {}
  });
  s.name = name;
  if (!s.best) s.best = {};

  const rounds = state.delivered || 0;
  const time = Math.round(state.finalRunTime);
  s.runs += 1;
  if (won) s.wins += 1;
  s.delivered += rounds;
  s.distance += Math.round((state.finalRunDistance || 0) / 10);
  s.coins += state.finalRunCoins || 0;
  s.seconds += time;
  s.lastPlayed = Date.now();

  const d = state.difficulty || 'medium';
  const old = s.best[d];
  if (rounds >= 1 && (!old || rounds > old.rounds || (rounds === old.rounds && time < old.time))) {
    s.best[d] = { rounds, time, date: Date.now() };
  }
  persistSave();
}

function submitLocal(record) {
  const idx = save.leaderboard.findIndex(e => e.name === record.name);
  if (idx >= 0) {
    const old = save.leaderboard[idx];
    if (record.rounds > old.rounds ||
        (record.rounds === old.rounds && record.time < old.time)) {
      save.leaderboard[idx] = record;
    }
  } else {
    save.leaderboard.push(record);
  }
  save.leaderboard.sort((a, b) => {
    if (b.rounds !== a.rounds) return b.rounds - a.rounds;
    return a.time - b.time;
  });
  save.leaderboard = save.leaderboard.slice(0, 30);
  persistSave();
}

/* Cheat codes (e.g. "bappa") skip rounds or force-complete the run, so a run
   they touched is never a real playthrough — it must not reach the
   leaderboard, locally or on the shared sheet. Lifetime stats on the User
   page still update, since those are personal and not competitive. */
function cheatedThisRun() { return !!state.runCheated; }

export function recordRunCaught() {
  freezeStats();
  recordRunStats(false);
  if (cheatedThisRun()) return;
  if (state.delivered < 1) return;
  const record = buildRecord();
  submitLocal(record);
  submitRun(record);
}

export function completeGame() {
  freezeStats();
  recordRunStats(true);

  if (!cheatedThisRun() && state.score > (save.bestScores[state.scene] || 0)) {
    save.bestScores[state.scene] = state.score;
    state.newBest = true;
  }

  if (!cheatedThisRun()) {
    const record = buildRecord();
    submitLocal(record);
    submitRun(record);
  }

  const idx = SCENE_ORDER.indexOf(state.scene);
  if (idx >= 0 && idx < SCENE_ORDER.length - 1) {
    const next = SCENE_ORDER[idx + 1];
    if (!save.unlockedScenes[next]) {
      save.unlockedScenes[next] = true;
      state.newSceneUnlocked = next;
    }
  }

  persistSave();

  playVictory();
  if (state.newSceneUnlocked) setTimeout(() => playSceneUnlock(), 1800);

  state.mode = 'win';
  state.fade = 0;
  state.winT = 0;
  state.celebration = null;

  import('../core/state.js').then(({ player }) => { player.pooja = true; });
}

export function scoreDelivery() { /* distance-based, not used for ranking */ }