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

function updateBest(score, seconds, rounds) {
  /* Update the player's all-time best metrics if beaten */
  const prev = save.leaderboard.find(e => e.name === save.playerName);
  const prevBest = prev ? prev.score : 0;
  if (score > prevBest) {
    return true;
  }
  return false;
}

function buildRecord() {
  return {
    name: save.playerName || 'Anonymous',
    score: Math.max(0, Math.round(state.finalRunDistance / 10)),
    seconds: Math.round(state.finalRunTime),
    roundsCompleted: state.delivered || 0,
    coinsHeld: save.coins,
    scene: state.scene,
    difficulty: state.difficulty,
    date: new Date().toLocaleDateString()
  };
}

function submitLocal(record) {
  const idx = save.leaderboard.findIndex(e => e.name === record.name);
  if (idx >= 0) {
    /* Only replace if this run beats the existing best score */
    if (record.score >= (save.leaderboard[idx].score || 0)) {
      save.leaderboard[idx] = record;
    } else {
      /* Still update the wallet column, keep old best stats */
      save.leaderboard[idx].coinsHeld = record.coinsHeld;
      save.leaderboard[idx].date = record.date;
    }
  } else {
    save.leaderboard.push(record);
  }
  save.leaderboard.sort((a, b) => b.score - a.score);
  save.leaderboard = save.leaderboard.slice(0, 20);
  persistSave();
}

export function recordRunCaught() {
  freezeStats();
  if (state.delivered < 1) return;
  const record = buildRecord();
  submitLocal(record);
  submitRun(record);
}

export function completeGame() {
  freezeStats();

  if (state.score > (save.bestScores[state.scene] || 0)) {
    save.bestScores[state.scene] = state.score;
    state.newBest = true;
  }

  const record = buildRecord();
  record.roundsCompleted = 5;
  submitLocal(record);
  submitRun(record);

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

export function scoreDelivery() { /* distance-based only */ }