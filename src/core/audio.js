/* ============================================================
   AUDIO — hybrid: file-based for music + aarti, procedural SFX
   ============================================================ */

const SOUND_FILES = {
  menuMusic: 'assets/sounds/music-menu.mp3',
  aartiBell: 'assets/sounds/aarti-bell.mp3',
  aartiWin:  'assets/sounds/aarti-win.mp3',
};

const files = {};     // key -> base Audio element
const ready = {};     // key -> true once canplaythrough fired
const failed = {};    // key -> true if load errored
let muted = false;

/* Procedural Web Audio context (SFX) */
let actx = null, noiseBuf = null, masterGain = null;

/* Currently playing menu music */
let currentMusic = null;

/* ------------------------------------------------------------
   File loading
   ------------------------------------------------------------ */
function preload(key, src) {
  if (files[key]) return;
  const a = new Audio();
  a.preload = 'auto';
  a.src = src;
  a.addEventListener('canplaythrough', () => { ready[key] = true; }, { once: true });
  a.addEventListener('error', () => { failed[key] = true; }, { once: true });
  files[key] = a;
}

function loadAll() {
  for (const k in SOUND_FILES) preload(k, SOUND_FILES[k]);
}

/* ------------------------------------------------------------
   Init / mute
   ------------------------------------------------------------ */
export function initAudio() {
  loadAll();
  if (actx) return;
  try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  if (!actx) return;

  masterGain = actx.createGain();
  masterGain.gain.value = muted ? 0 : 0.55;
  masterGain.connect(actx.destination);

  const len = Math.floor(actx.sampleRate * 0.25);
  noiseBuf = actx.createBuffer(1, len, actx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
}

export function isMuted() { return muted; }

export function toggleMute() {
  muted = !muted;
  if (masterGain && actx) {
    masterGain.gain.setTargetAtTime(muted ? 0 : 0.55, actx.currentTime, 0.02);
  }
  if (currentMusic) currentMusic.volume = muted ? 0 : 0.4;
  return muted;
}

/* ------------------------------------------------------------
   File playback helpers
   ------------------------------------------------------------ */
function playFile(key, volume = 0.9) {
  if (muted) return false;
  if (failed[key]) return false;
  if (!ready[key]) return false;
  const base = files[key];
  if (!base) return false;
  try {
    base.currentTime = 0;
    base.volume = volume;
    base.play().catch(() => {});
    return true;
  } catch (e) { return false; }
}

function startLoopFile(key, volume) {
  if (failed[key]) return null;
  const base = files[key];
  if (!base) return null;
  const a = base.cloneNode();
  a.loop = true;
  a.volume = muted ? 0 : volume;
  a.play().catch(() => {});
  return a;
}

/* ------------------------------------------------------------
   Aarti bell (red light) — file first, procedural fallback
   ------------------------------------------------------------ */
export function playBell() {
  if (playFile('aartiBell', 0.85)) return;
  if (!actx) return;
  const t = actx.currentTime;
  [1046, 1568, 2093, 2637].forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.16 / (i + 1), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.7);
    o.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t + 1.8);
  });
}

/* ------------------------------------------------------------
   Victory aarti — file first, procedural fallback
   ------------------------------------------------------------ */
export function playVictory() {
  if (playFile('aartiWin', 0.95)) return;
  if (!actx) return;
  const t = actx.currentTime;
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'triangle'; o.frequency.value = f;
    const st = t + i * 0.13;
    g.gain.setValueAtTime(0.0001, st);
    g.gain.linearRampToValueAtTime(0.2, st + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, st + 1.2);
    o.connect(g); g.connect(masterGain);
    o.start(st); o.stop(st + 1.3);
  });
}

/* ------------------------------------------------------------
   Procedural SFX
   ------------------------------------------------------------ */
export function playDrum(vol) {
  if (!actx) return;
  const t = actx.currentTime;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(190, t);
  o.frequency.exponentialRampToValueAtTime(52, t + 0.16);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + 0.3);

  const n = actx.createBufferSource(), ng = actx.createGain(), bp = actx.createBiquadFilter();
  n.buffer = noiseBuf;
  bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 0.8;
  ng.gain.setValueAtTime(vol * 0.35, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  n.connect(bp); bp.connect(ng); ng.connect(masterGain);
  n.start(t); n.stop(t + 0.1);
}

export function playChime() {
  if (!actx) return;
  const t = actx.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    const st = t + i * 0.09;
    g.gain.setValueAtTime(0.0001, st);
    g.gain.linearRampToValueAtTime(0.13, st + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, st + 0.9);
    o.connect(g); g.connect(masterGain);
    o.start(st); o.stop(st + 1.0);
  });
}

export function playFail() {
  if (!actx) return;
  const t = actx.currentTime;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(420, t);
  o.frequency.exponentialRampToValueAtTime(55, t + 0.85);
  g.gain.setValueAtTime(0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + 1.0);
}

export function playCoin() {
  if (!actx) return;
  const t = actx.currentTime;
  [1200, 1600, 2000].forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'triangle'; o.frequency.value = f;
    const st = t + i * 0.06;
    g.gain.setValueAtTime(0.0001, st);
    g.gain.linearRampToValueAtTime(0.12, st + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, st + 0.35);
    o.connect(g); g.connect(masterGain);
    o.start(st); o.stop(st + 0.4);
  });
}

export function playClick() {
  if (!actx) return;
  const t = actx.currentTime;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(900, t);
  o.frequency.exponentialRampToValueAtTime(1400, t + 0.06);
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(0.22, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + 0.15);
}

export function playHover() {
  if (!actx) return;
  const t = actx.currentTime;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'sine'; o.frequency.value = 1900;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.05, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + 0.1);
}

export function playJump() {
  if (!actx) return;
  const t = actx.currentTime;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(380, t);
  o.frequency.exponentialRampToValueAtTime(900, t + 0.12);
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(0.16, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + 0.18);
}

export function playFootstep() {
  if (!actx) return;
  const t = actx.currentTime;
  const n = actx.createBufferSource(), g = actx.createGain(), lp = actx.createBiquadFilter();
  n.buffer = noiseBuf;
  lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = 0.9;
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(0.09, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
  n.connect(lp); lp.connect(g); g.connect(masterGain);
  n.start(t); n.stop(t + 0.08);
}

export function playRoundStart() {
  if (!actx) return;
  const t = actx.currentTime;
  [523, 659, 784].forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    const st = t + i * 0.1;
    g.gain.setValueAtTime(0.0001, st);
    g.gain.linearRampToValueAtTime(0.18, st + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, st + 0.5);
    o.connect(g); g.connect(masterGain);
    o.start(st); o.stop(st + 0.55);
  });
}

export function playSceneUnlock() {
  if (!actx) return;
  const t = actx.currentTime;
  [523, 659, 784, 1047, 1319].forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'triangle'; o.frequency.value = f;
    const st = t + i * 0.09;
    g.gain.setValueAtTime(0.0001, st);
    g.gain.linearRampToValueAtTime(0.16, st + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, st + 0.7);
    o.connect(g); g.connect(masterGain);
    o.start(st); o.stop(st + 0.75);
  });
}

/* ------------------------------------------------------------
   Scene ambience (procedural)
   ------------------------------------------------------------ */
export function playAmbientTick(scene) {
  if (!actx) return;
  const t = actx.currentTime;

  if (scene === 'night') {
    [0, 0.09].forEach(offset => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = 4200 + Math.random() * 400;
      const st = t + offset;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.linearRampToValueAtTime(0.035, st + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.05);
      o.connect(g); g.connect(masterGain);
      o.start(st); o.stop(st + 0.06);
    });
  } else if (scene === 'day') {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(1800, t);
    o.frequency.exponentialRampToValueAtTime(2600, t + 0.06);
    o.frequency.exponentialRampToValueAtTime(2200, t + 0.12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t + 0.2);
  } else if (scene === 'evening') {
    [1568, 2093, 2637].forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const st = t + i * 0.02;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.linearRampToValueAtTime(0.045, st + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.6);
      o.connect(g); g.connect(masterGain);
      o.start(st); o.stop(st + 0.65);
    });
  }
}

/* ------------------------------------------------------------
   Menu music — file-based loop
   ------------------------------------------------------------ */
export function startMenuMusic() {
  initAudio();
  if (currentMusic) return;
  if (failed.menuMusic) return;
  const a = startLoopFile('menuMusic', 0.4);
  if (a) currentMusic = a;
}

export function stopMenuMusic() {
  if (!currentMusic) return;
  try { currentMusic.pause(); } catch (e) {}
  currentMusic = null;
}

export function isMusicPlaying() { return !!currentMusic; }