import { state, camera, player, world } from './state.js';
import { updatePlaying } from '../gameplay/playing.js';
import { updateParticles, updateAmbient } from '../world/particles.js';
import { draw } from '../draw.js';
import { playBell, startMenuMusic, stopMenuMusic, playAmbientTick } from './audio.js';
import { particles } from '../world/particles.js';

let last = performance.now();
let ambientTimer = 0;

export function startLoop() {
  requestAnimationFrame(loop);
}

function loop(now) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.05) dt = 0.05;
  if (dt < 0) dt = 0;

  /* Guard the whole frame so a single bad call can't kill the game */
  try {
    update(dt);
  } catch (e) {
    console.error('[update error]', e);
  }
  try {
    draw();
  } catch (e) {
    console.error('[draw error]', e);
  }

  requestAnimationFrame(loop);
}

function update(dt) {
  if (state.mode === 'paused') return;

  camera.time += dt;

  if (state.cheatToast > 0) state.cheatToast = Math.max(0, state.cheatToast - dt);
  if (state.muteToast  > 0) state.muteToast  = Math.max(0, state.muteToast  - dt);
    if (state.fullscreenToast > 0) state.fullscreenToast = Math.max(0, state.fullscreenToast - dt);
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 2.2);
  if (state.flash > 0) state.flash = Math.max(0, state.flash - dt * 2.0);
  if (state.fade  > 0) state.fade  = Math.max(0, state.fade  - dt * 2.6);

  if (state.celebration) {
    state.celebration.timer -= dt;
    if (state.celebration.timer <= 0) state.celebration = null;
  }

  /* Music & ambience routing */
  const wantsMusic = state.mode === 'menu' || state.mode === 'instructions' ||
                     state.mode === 'intro' || state.mode === 'sceneSelect' ||
                     state.mode === 'diffSelect' || state.mode === 'nameEntry' ||
                     state.mode === 'leaderboard' || state.mode === 'shop';
  if (wantsMusic) startMenuMusic(); else stopMenuMusic();

  if (state.mode === 'playing') {
    ambientTimer -= dt;
    if (ambientTimer <= 0) {
      playAmbientTick(state.scene);
      ambientTimer = 1.8 + Math.random() * 3.2;
    }
  } else {
    ambientTimer = 0;
  }

  if (state.mode === 'intro') {
    state.introT += dt;
  } else if (state.mode === 'playing') {
    updatePlaying(dt);
    updateAmbient(dt);
  } else if (state.mode === 'caught') {
    state.timer -= dt;
    if (state.timer <= 0) {
      state.delivered = 0;
      import('../gameplay/rounds.js').then(m => m.startRound(1));
    }
  } else if (state.mode === 'win') {
    updateWinAnimation(dt);
    updateAmbient(dt);
  }

  updateParticles(dt);
  updateCamera(dt);
}

function updateCamera(dt) {
  let target = player.x - 960 * 0.38;
  target = Math.max(0, Math.min(world.max, target));
  camera.x += (target - camera.x) * (1 - Math.exp(-8 * dt));
}

function updateWinAnimation(dt) {
  state.winT += dt;

  if (state.winT < 12 && Math.random() < dt * 16) {
    particles.push({
      x: world.pandalCx - 300 + Math.random() * 600, y: -20,
      vx: (Math.random() - 0.5) * 40, vy: 45 + Math.random() * 55,
      life: 9, max: 9,
      col: ['#ff8c1a','#ffb84d','#ff5b5b','#ffd24a','#ffe9b0'][Math.floor(Math.random() * 5)],
      r: 3 + Math.random() * 2.5,
      petal: true, rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 5
    });
  }
  if (state.winT < 8) {
    const beat = Math.floor(state.winT * 0.75);
    const prev = Math.floor((state.winT - dt) * 0.75);
    if (beat !== prev) playBell();
  }
  if (Math.random() < dt * 10) {
    particles.push({
      x: world.pandalCx - 90 + Math.random() * 180,
      y: 100 + Math.random() * 240,
      vx: (Math.random() - 0.5) * 40, vy: -25 - Math.random() * 40,
      life: 1.6, max: 1.6, col: '#fff2b0', r: 1.5 + Math.random() * 2
    });
  }
}