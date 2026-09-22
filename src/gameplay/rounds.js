import { state, player, world, setWorldBounds, camera } from '../core/state.js';
import { GROUND_Y, PLATE_X } from '../core/config.js';
import { DIFFICULTIES } from '../data/difficulties.js';
import { particles, initAmbient, spawnSparkles } from '../world/particles.js';
import { buildObstacles } from '../world/obstacles.js';
import { spawnCoinsForRound } from '../world/coins.js';
import { resetLightCycle } from './lightCycle.js';
import { completeGame, recordRunCaught } from './scoring.js';
import { playChime, playFail, playRoundStart } from '../core/audio.js';
export function resetPlayer() {
  player.x = 210; player.y = GROUND_Y; player.vy = 0;
  player.onGround = true; player.facing = 1; player.animT = 0;
  player.holding = false; player.aarti = false;
  player.moving = false; player.jumpHeld = false;
  player.crouching = false; player.interactRequested = false;
  player.pooja = false;
}

export function setupWorldForRound(n) {
  const diff = DIFFICULTIES[state.difficulty];
  const tripLen = diff.lengths[n - 1];
  const placeX  = PLATE_X + tripLen;
  const pandalCx = placeX + 80;
  const totalW   = pandalCx + 400;
  const camMax   = Math.max(0, totalW - 960);
  setWorldBounds(totalW, camMax, pandalCx, placeX);
}

export function startRound(n) {
  if (n === 1) {
    state.score = 0;
    state.roundScores = [];
    state.completionBonus = 0;
    state.coinsEarned = 0;
    state.newBest = false;
    state.newSceneUnlocked = null;
    state.runDistance = 0;
    state.runCoins = 0;
    state.runStartTime = camera.time;
    state.finalRunTime = 0;
    state.finalRunDistance = 0;
    state.finalRunCoins = 0;
    state.runCheated = false;   // fresh run — clean slate for the leaderboard
    player.pooja = false;
  }
  state.round = n;
  resetLightCycle();
  state.mode = 'playing';
  state.fade = 1;
  state.celebration = null;
  setupWorldForRound(n);
  buildObstacles(n);
  spawnCoinsForRound(n);
  resetPlayer();
  initAmbient();
  camera.x = 0;
  state.roundStartTime = camera.time;
}

export function onCaught() {
  recordRunCaught();
  state.mode = 'caught';
  state.timer = 2.2;
  state.shake = 1; state.flash = 1;
  state.celebration = null;
  playFail();
  for (let i = 0; i < 24; i++) {
    particles.push({
      x: player.x, y: player.y - 50,
      vx: (Math.random() - 0.5) * 420, vy: -Math.random() * 340 - 60,
      life: 0.7 + Math.random() * 0.7, max: 1.4,
      col: '#ff4444', r: 2 + Math.random() * 3
    });
  }
}

export function placeModak() {
  player.holding = false;
  state.delivered++;
  playChime();

  for (let i = 0; i < 34; i++) {
    particles.push({
      x: player.x + 20, y: player.y - 60,
      vx: (Math.random() - 0.5) * 340, vy: -Math.random() * 320 - 40,
      life: 0.8 + Math.random() * 0.8, max: 1.6,
      col: i % 3 === 0 ? '#fff2b0' : '#ffc44a',
      r: 2 + Math.random() * 3
    });
  }


  if (state.delivered >= 5) { completeGame(); return; }

  /* Advance to next round */
  const nextRound = state.delivered + 1;
  state.round = nextRound;
  setupWorldForRound(nextRound);
  buildObstacles(nextRound);
  spawnCoinsForRound(nextRound);
  resetLightCycle();

  state.flash = 0.9;
  player.x = world.placeX;
  player.y = GROUND_Y;
  player.vy = 0;
  player.onGround = true;
  player.facing = -1;
  player.crouching = false;
  camera.x = Math.max(0, Math.min(world.max, player.x - 960 * 0.38));

  /* Reset round timer for the new round */
  state.roundStartTime = camera.time;

  playRoundStart();
  state.celebration = {
    text: 'ROUND ' + nextRound + ' BEGINS',
    sub: 'Run back to the plate!',
    timer: 2.2, max: 2.2
  };
}

export { spawnSparkles };