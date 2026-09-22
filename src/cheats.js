import { state, player, world, setWorldBounds, camera } from './core/state.js';
import { GROUND_Y, PLATE_X } from './core/config.js';
import { DIFFICULTIES } from './data/difficulties.js';
import { save, persistSave } from './core/save.js';
import { buildObstacles } from './world/obstacles.js';
import { initAmbient } from './world/particles.js';
import { resetLightCycle } from './gameplay/lightCycle.js';
import { setupWorldForRound } from './gameplay/rounds.js';
import { completeGame } from './gameplay/scoring.js';
import { initAudio } from './core/audio.js';

let buf = '';

export function processCheatKey(k) {
  buf += k.toLowerCase();
  if (buf.endsWith('pooja')) { buf = ''; triggerPooja(); return; }
  if (buf.endsWith('bappa')) { buf = ''; skipToFinal(); return; }
  if (buf.endsWith('laxmi')) { buf = ''; addCoins(); return; }
  if (buf.endsWith('ganesh')) { buf = ''; unlockAll(); return; }
  if (buf.length > 14) buf = buf.slice(-14);
}

export function showCheatToast(msg) {
  state.cheatMsg = msg;
  state.cheatToast = 2.4;
}

function skipToFinal() {
  initAudio();
  state.runCheated = true;    // this run must never reach the leaderboard
  state.round = 5; state.delivered = 4;
  state.mode = 'playing'; state.fade = 0.6; state.flash = 1;
  state.celebration = null;
  setupWorldForRound(5);
  resetLightCycle();
  buildObstacles(5);
  initAmbient();
  player.x = world.placeX - 10; player.y = GROUND_Y; player.vy = 0;
  player.onGround = true; player.facing = 1; player.holding = true;
  player.crouching = false; player.aarti = false; player.pooja = false;
  camera.x = Math.max(0, Math.min(world.max, player.x - 960 * 0.38));
  showCheatToast('CHEAT: Round 5 â€” press E to offer.');
}

function triggerPooja() {
  initAudio();
  state.runCheated = true;    // this run must never reach the leaderboard
  state.delivered = 5; state.round = 5;
  setupWorldForRound(5); buildObstacles(5); initAmbient();
  player.x = world.placeX - 10; player.y = GROUND_Y; player.vy = 0;
  player.onGround = true; player.holding = false; player.pooja = true;
  player.facing = 1; player.crouching = false; player.aarti = false;
  camera.x = Math.max(0, Math.min(world.max, player.x - 960 * 0.42));
  completeGame();
  showCheatToast('CHEAT: Pooja triggered.');
}

function addCoins() {
  save.coins += 5000;
  persistSave();
  showCheatToast('CHEAT: +5000 coins.');
}

function unlockAll() {
  save.unlockedScenes.night = true;
  save.unlockedScenes.day = true;
  save.unlockedScenes.evening = true;
  persistSave();
  showCheatToast('CHEAT: All scenes unlocked.');
}
