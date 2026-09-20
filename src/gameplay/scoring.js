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
    rounds: state.delivered || 0,
    time: Math.round(state.finalRunTime),
    coinsHeld: save.coins,
    date: new Date().toLocaleDateString()
  };
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

export function scoreDelivery() { /* distance-based, not used for ranking */ }