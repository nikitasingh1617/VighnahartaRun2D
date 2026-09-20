/* ============================================================
   AUDIO — file-based SFX with procedural fallback
   ============================================================ */

const SOUND_FILES = {
  dhol:    'assets/sounds/dhol.mp3',
  bell:    'assets/sounds/bell.mp3',
  caution: 'assets/sounds/caution.mp3',
  click:   'assets/sounds/click.mp3',
  coin:    'assets/sounds/coin.mp3',
  jump:    'assets/sounds/jump.mp3',
  success: 'assets/sounds/success.mp3',
};

const files = {};
const ready = {};
const failed = {};
let muted = false;

let actx = null, noiseBuf = null, masterGain = null;

let usingProceduralMusic = false;
let musicTimer = null;
let musicStep = 0;

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
  return muted;
}

/* ------------------------------------------------------------
   File playback helper
   ------------------------------------------------------------ */
function playFile(key, volume = 0.9) {
  if (muted) return false;
  if (failed[key]) return false;
  if (!ready[key]) return false;
  const base = files[key];
  if (!base) return false;
  try {
    const a = base.cloneNode();
    a.volume = volume;
    a.play().catch(() => {});
    return true;
  } catch (e) { return false; }
}

/* ============================================================
   PROCEDURAL PERCUSSION — layered dhol kit
   ============================================================ */

/* Deep kick (dha) — sub bass + click transient */
function triggerKick(volume, when) {
  if (!actx) return;
  const t = when || actx.currentTime;

  /* Low body */
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(185, t);
  o.frequency.exponentialRampToValueAtTime(52, t + 0.14);
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + 0.28);

  /* Click */
  if (noiseBuf) {
    const n = actx.createBufferSource();
    const ng = actx.createGain();
    const hp = actx.createBiquadFilter();
    n.buffer = noiseBuf;
    hp.type = 'highpass'; hp.frequency.value = 1400;
    ng.gain.setValueAtTime(volume * 0.28, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    n.connect(hp); hp.connect(ng); ng.connect(masterGain);
    n.start(t); n.stop(t + 0.04);
  }
}

/* Snare (ta) — noise crack + body thump */
function triggerSnare(volume, when) {
  if (!actx) return;
  const t = when || actx.currentTime;

  if (noiseBuf) {
    const n = actx.createBufferSource();
    const ng = actx.createGain();
    const bp = actx.createBiquadFilter();
    n.buffer = noiseBuf;
    bp.type = 'bandpass'; bp.frequency.value = 2300; bp.Q.value = 0.6;
    ng.gain.setValueAtTime(volume * 0.6, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
    n.connect(bp); bp.connect(ng); ng.connect(masterGain);
    n.start(t); n.stop(t + 0.12);
  }

  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(240, t);
  o.frequency.exponentialRampToValueAtTime(140, t + 0.07);
  g.gain.setValueAtTime(volume * 0.32, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + 0.14);
}

/* Tuned tom (dhin) — mid-pitch hit */
function triggerTom(volume, when) {
  if (!actx) return;
  const t = when || actx.currentTime;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(320, t);
  o.frequency.exponentialRampToValueAtTime(135, t + 0.11);
  g.gain.setValueAtTime(volume * 0.75, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.19);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + 0.21);
}

/* Metallic tick (tin) — high rimshot */
function triggerTick(volume, when) {
  if (!actx) return;
  const t = when || actx.currentTime;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = 'triangle';
  o.frequency.value = 3300;
  g.gain.setValueAtTime(volume * 0.42, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.048);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + 0.055);
}

/* Sub bass boom — sits under the kick on strong beats */
function triggerBass(volume, when) {
  if (!actx) return;
  const t = when || actx.currentTime;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(100, t);
  o.frequency.exponentialRampToValueAtTime(44, t + 0.30);
  g.gain.setValueAtTime(volume * 0.85, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + 0.44);
}

/* Six-beat dhol groove — loops continuously during a run */
const DRUM_PATTERN = [
  'dha',     // 1 — kick + bass boom
  'tin',     // 2 — rim tick
  'dha',     // 3 — plain kick
  'ta',      // 4 — snare + tom
  'dha',     // 5 — kick + bass boom
  'tin-tin'  // 6 — double rim tick
];

let drumStep = 0;

/* Called on green-light beats. Small volumes = jump/pickup accent */
export function playDrum(vol) {
  if (!actx) return;

  /* If a dhol.mp3 was loaded, use that and skip procedural */
  if (playFile('dhol', 0.6 * (vol || 1))) return;

  const v = vol || 0.5;

  /* Quiet hits (jump, pickup) — soft tom accent, no pattern advance */
  if (v < 0.25) {
    triggerTom(v * 2.4);
    return;
  }

  const step = DRUM_PATTERN[drumStep % DRUM_PATTERN.length];
  drumStep++;

  switch (step) {
    case 'dha':
      triggerKick(v * 0.95);
      triggerBass(v * 0.6);
      break;
    case 'tin':
      triggerTick(v);
      break;
    case 'ta':
      triggerSnare(v * 0.9);
      triggerTom(v * 0.45);
      break;
    case 'tin-tin': {
      const t0 = actx.currentTime;
      triggerTick(v * 0.85, t0);
      triggerTick(v * 0.65, t0 + 0.085);
      break;
    }
  }
}

/* ============================================================
   Aarti bell — bell.mp3 for the red light
   ============================================================ */
export function playBell() {
  if (playFile('bell', 0.85)) return;
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

/* ============================================================
   Victory aarti — procedural (waiting on a file)
   ============================================================ */
export function playVictory() {
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

/* ============================================================
   Caught / fail — caution.mp3
   ============================================================ */
export function playFail() {
  if (playFile('caution', 0.9)) return;
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

/* ============================================================
   Button click — click.mp3
   ============================================================ */
export function playClick() {
  if (playFile('click', 0.7)) return;
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

/* ============================================================
   Coin pickup — coin.mp3
   ============================================================ */
export function playCoin() {
  if (playFile('coin', 0.8)) return;
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

/* ============================================================
   Jump — jump.mp3
   ============================================================ */
export function playJump() {
  if (playFile('jump', 0.7)) return;
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

/* ============================================================
   Chime on every modak delivery — success.mp3
   ============================================================ */
export function playChime() {
  if (playFile('success', 0.85)) return;
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

/* ============================================================
   Procedural-only sounds
   ============================================================ */
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

/* ============================================================
   Scene ambience
   ============================================================ */
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

/* ============================================================
   Procedural menu music
   ============================================================ */
const MELODY = [
  523, 587, 622, 784, 831, 1046,
  831, 784, 622, 587, 523, 466,
  523, 587, 622, 784, 831, 1046,
  1046, 831, 784, 622, 587, 523
];
const BASS_NOTES = [
  131, 131, 175, 175, 131, 131, 175, 175,
  131, 131, 175, 175, 131, 131, 175, 175,
  131, 131, 175, 175, 131, 131, 175, 175
];

function playSynthNote(freq, dur, vol) {
  if (!actx || muted) return;
  const t = actx.currentTime;
  const o = actx.createOscillator(), o2 = actx.createOscillator(), g = actx.createGain();
  o.type = 'sine'; o.frequency.value = freq;
  o2.type = 'triangle'; o2.frequency.value = freq * 1.004;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.06);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); o2.connect(g);
  g.connect(masterGain);
  o.start(t); o.stop(t + dur + 0.1);
  o2.start(t); o2.stop(t + dur + 0.1);
}

export function startMenuMusic() {
  initAudio();
  if (usingProceduralMusic) return;
  if (!actx) return;
  usingProceduralMusic = true;
  musicStep = 0;
  const beat = 640;
  musicTimer = setInterval(() => {
    if (!usingProceduralMusic || muted) return;
    const m = MELODY[musicStep % MELODY.length];
    const b = BASS_NOTES[musicStep % BASS_NOTES.length];
    playSynthNote(m, 0.7, 0.055);
    if (musicStep % 2 === 0) playSynthNote(b, 1.1, 0.08);
    musicStep++;
  }, beat);
}

export function stopMenuMusic() {
  usingProceduralMusic = false;
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
}

export function isMusicPlaying() { return usingProceduralMusic; }