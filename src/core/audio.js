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

/* ------------------------------------------------------------
   BACKGROUND MUSIC
   Drop your own track at  assets/sounds/background.mp3  and it is
   used automatically (looped, with a fade in/out).
   If that file is missing or can't be decoded, the built-in synth
   track further down plays instead — so the game is never silent.
   ------------------------------------------------------------ */
const MUSIC = {
  file:            'assets/sounds/background.mp3',
  fileVolume:      0.45,   // 0..1 — volume of your mp3
  proceduralVolume: 1.00,  // 0..1 — volume of the built-in fallback track
  fadeInMs:        900,
  fadeOutMs:       350,
};

/* dhol.mp3 is a 6.5 s rhythm LOOP, not a single drum hit. Firing it on every
   beat stacked ~12 overlapping copies (a muddy wall of drums that got louder
   and faster during the "drum roll"). So beats now use the built-in synth dhol
   kit. If you ever get a single-hit dhol sample, set this to true. */
const USE_DHOL_FILE = false;

const files = {};
const ready = {};
const failed = {};
let muted = false;

let actx = null, noiseBuf = null, masterGain = null;

/* Music state */
const fileMusic = { el: null, state: 'idle' };   // state: idle | loading | ready | failed
let musicWanted = false;      // the game wants music right now
let musicMode = 'none';       // what is actually sounding: none | file | proc
let musicPlayPending = false; // a play() request is in flight
let musicBlocked = false;     // browser refused autoplay — waits for a tap/key
let proc = null;              // running synth track (see bottom of file)

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
  for (const k in SOUND_FILES) {
    if (k === 'dhol' && !USE_DHOL_FILE) continue;   // unused loop — skip the download
    preload(k, SOUND_FILES[k]);
  }
}

/* ------------------------------------------------------------
   Init / mute
   ------------------------------------------------------------ */
export function initAudio() {
  loadAll();
  loadMusicFile();
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
  if (fileMusic.el) fileMusic.el.muted = muted;
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
function triggerTom(volume, when, pitch = 1) {
  if (!actx) return;
  const t = when || actx.currentTime;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(320 * pitch, t);
  o.frequency.exponentialRampToValueAtTime(135 * pitch, t + 0.11);
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

  /* Optional: a single-hit dhol sample (see USE_DHOL_FILE at the top) */
  if (USE_DHOL_FILE && playFile('dhol', 0.6 * (vol || 1))) return;

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

/* ------------------------------------------------------------
   DRUM ROLL — the "get ready to freeze" warning before the aarti bell.
   Alternating snare/tom hits that swell in volume as the bell gets closer.
   How FAST the hits come is set in gameplay/lightCycle.js (ROLL_EVERY_*).
   ------------------------------------------------------------ */
const ROLL_VOL_START = 0.34;   // first hit of the roll
const ROLL_VOL_END   = 0.52;   // last hit, right before the bell
let rollHand = 0;

/* progress: 0 (roll just started) -> 1 (bell is about to ring) */
export function playDrumRoll(progress = 0) {
  if (!actx) return;
  const p = Math.max(0, Math.min(1, progress));
  const v = ROLL_VOL_START + (ROLL_VOL_END - ROLL_VOL_START) * p;
  const leftHand = (rollHand++ % 2) === 0;
  triggerSnare(v * 0.85);
  triggerTom(v * 0.9, undefined, leftHand ? 1.0 : 0.88);
  if (leftHand) triggerBass(v * 0.45);   // a little body on every other hit
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
   BACKGROUND MUSIC
   1) assets/sounds/background.mp3  (your own track — preferred)
   2) built-in synth track          (fallback, see below)
   The game calls startMenuMusic() / stopMenuMusic() (see core/loop.js);
   startBackgroundMusic / stopBackgroundMusic are friendlier aliases.
   ============================================================ */

/* ---- Load background.mp3 (once) ---- */
function loadMusicFile() {
  if (fileMusic.state !== 'idle') return;
  fileMusic.state = 'loading';
  try {
    const a = new Audio();
    a.preload = 'auto';
    a.loop = true;
    a.volume = 0;
    a.muted = muted;
    a.addEventListener('canplay', () => {
      if (fileMusic.state === 'loading') fileMusic.state = 'ready';
      if (musicWanted) startMenuMusic();
    }, { once: true });
    a.addEventListener('error', () => {
      /* Missing / undecodable file -> use the synth fallback */
      fileMusic.state = 'failed';
      if (musicWanted) startMenuMusic();
    }, { once: true });
    a.src = MUSIC.file;
    fileMusic.el = a;
  } catch (e) {
    fileMusic.state = 'failed';
  }
}

/* Simple volume fade for the <audio> element */
let fadeTimer = null;
function fadeElement(el, target, ms, done) {
  if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
  const from = el.volume;
  const t0 = performance.now();
  fadeTimer = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / Math.max(1, ms));
    try { el.volume = Math.max(0, Math.min(1, from + (target - from) * k)); } catch (e) {}
    if (k >= 1) {
      clearInterval(fadeTimer); fadeTimer = null;
      if (done) done();
    }
  }, 40);
}

function startFileMusic() {
  const el = fileMusic.el;
  if (!el) return;
  musicPlayPending = true;
  const onPlaying = () => {
    musicPlayPending = false;
    if (!musicWanted) { el.pause(); return; }
    musicMode = 'file';
    fadeElement(el, MUSIC.fileVolume, MUSIC.fadeInMs);
  };
  const onRefused = () => {
    /* Browser autoplay policy — retry on the next tap / key press */
    musicPlayPending = false;
    musicBlocked = true;
  };
  try {
    const p = el.play();
    if (p && p.then) p.then(onPlaying, onRefused);
    else onPlaying();
  } catch (e) { onRefused(); }
}

export function startMenuMusic() {
  musicWanted = true;
  if (musicMode !== 'none' || musicPlayPending || musicBlocked) return;
  initAudio();

  if (fileMusic.state === 'ready') { startFileMusic(); return; }
  if (fileMusic.state === 'failed') { startProceduralMusic(); musicMode = proc ? 'proc' : 'none'; return; }
  /* still 'loading' — the canplay / error handler will call us again */
}

export function stopMenuMusic() {
  musicWanted = false;

  if (musicMode === 'proc') stopProceduralMusic();
  if (musicMode === 'file' && fileMusic.el) {
    const el = fileMusic.el;
    fadeElement(el, 0, MUSIC.fadeOutMs, () => { if (!musicWanted) el.pause(); });
  }
  musicMode = 'none';
}

export const startBackgroundMusic = startMenuMusic;
export const stopBackgroundMusic  = stopMenuMusic;
export function isMusicPlaying() { return musicMode !== 'none'; }

/* Browsers block sound until the player taps / presses a key. Unlock on the
   first gesture, and let the music retry. */
function unlockAudio() {
  if (actx && actx.state === 'suspended') { try { actx.resume().catch(() => {}); } catch (e) {} }
  musicBlocked = false;
}
['pointerdown', 'touchend', 'keydown'].forEach(ev =>
  window.addEventListener(ev, unlockAudio, { capture: true, passive: true })
);

/* Don't keep playing music while the tab is hidden */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (musicMode === 'file' && fileMusic.el) { fileMusic.el.pause(); musicMode = 'none'; }
    if (actx && actx.state === 'running') { try { actx.suspend().catch(() => {}); } catch (e) {} }
  } else if (actx && actx.state === 'suspended') {
    try { actx.resume().catch(() => {}); } catch (e) {}
  }
});

/* ============================================================
   FALLBACK TRACK — "Ganpati Sandhya"
   A calm, festive raag-style loop, deliberately different from the old
   one: a soft flute melody in the Bhoopali (major-pentatonic) scale over a
   tanpura-style drone. Slower, lower and mellower, with a 64-step tune
   instead of a short repeating arpeggio.
   ============================================================ */
const STEP_SEC = 0.40;                 // one eighth-note (~75 BPM)
const SCALE = [0, 2, 4, 7, 9];         // C D E G A (semitones from C)
const ROOT_HZ = 261.63;                // C4

/* n = scale index (0 = C4, 1 = D4, 2 = E4, 3 = G4, 4 = A4, 5 = C5 ...) */
function scaleFreq(n) {
  const oct = Math.floor(n / 5);
  const deg = ((n % 5) + 5) % 5;
  return ROOT_HZ * Math.pow(2, (12 * oct + SCALE[deg]) / 12);
}

/* [scaleIndex | null (rest), lengthInSteps] — each phrase = 32 steps (4 bars) */
const PHRASES = [
  [ [2,2],[3,1],[4,1],[3,2],[2,2],   [1,2],[2,1],[1,1],[0,4],
    [2,2],[3,1],[4,1],[5,2],[4,2],   [3,2],[2,2],[1,2],[0,2] ],
  [ [4,2],[5,1],[6,1],[5,2],[4,2],   [3,2],[4,1],[3,1],[2,2],[null,2],
    [2,1],[3,1],[4,1],[5,1],[6,2],[7,2],   [6,2],[5,1],[4,1],[3,1],[2,1],[0,2] ]
];

/* Flatten to one entry per step (note at its first step, null elsewhere) */
const SEQ = [];
for (const phrase of PHRASES) {
  for (const [n, len] of phrase) {
    SEQ.push(n === null ? null : { n, len });
    for (let i = 1; i < len; i++) SEQ.push(null);
  }
}

/* Tanpura string pattern: Pa – Sa – Sa – low Sa */
const TANPURA = [196.00, 261.63, 261.63, 130.81];

function fluteNote(p, freq, t, dur) {
  const o1 = actx.createOscillator(), o2 = actx.createOscillator();
  const g = actx.createGain(), g2 = actx.createGain(), lp = actx.createBiquadFilter();
  o1.type = 'sine';  o1.frequency.value = freq;
  o2.type = 'sine';  o2.frequency.value = freq * 2;
  g2.gain.value = 0.16;                           // a touch of 2nd harmonic = "breathy" tone
  lp.type = 'lowpass'; lp.frequency.value = 2400;
  p.vibDepth.connect(o1.detune);
  p.vibDepth.connect(o2.detune);
  o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp); lp.connect(p.out);

  const peak = 0.16;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.07);
  g.gain.linearRampToValueAtTime(peak * 0.7, t + dur);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.30);
  o1.start(t); o2.start(t);
  o1.stop(t + dur + 0.35); o2.stop(t + dur + 0.35);
}

function pluckNote(p, freq, t, vol) {
  const o = actx.createOscillator(), o2 = actx.createOscillator();
  const g = actx.createGain(), g2 = actx.createGain(), lp = actx.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = freq;
  o2.type = 'sine';    o2.frequency.value = freq * 2.005;
  g2.gain.value = 0.35;
  lp.type = 'lowpass'; lp.frequency.value = 1800;
  o.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp); lp.connect(p.out);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
  o.start(t); o2.start(t);
  o.stop(t + 2.3); o2.stop(t + 2.3);
}

function scheduleMusic() {
  if (!proc || !actx) return;
  if (proc.next < actx.currentTime) proc.next = actx.currentTime + 0.05;   // catch up after a stall
  const horizon = actx.currentTime + 1.0;
  while (proc.next < horizon) {
    const step = proc.step;
    const s = SEQ[step % SEQ.length];
    if (s) fluteNote(proc, scaleFreq(s.n), proc.next, s.len * STEP_SEC * 0.95);
    if (step % 2 === 0) {
      pluckNote(proc, TANPURA[(step / 2) % TANPURA.length], proc.next, 0.07);
    }
    proc.next += STEP_SEC;
    proc.step++;
  }
}

function startProceduralMusic() {
  if (!actx || !masterGain || proc) return;
  const t0 = actx.currentTime;

  const out = actx.createGain();
  out.gain.setValueAtTime(0.0001, t0);
  out.gain.linearRampToValueAtTime(MUSIC.proceduralVolume, t0 + 1.2);
  out.connect(masterGain);

  /* Shared vibrato LFO (5 Hz, ±7 cents) for the flute */
  const vib = actx.createOscillator();
  vib.frequency.value = 5.2;
  const vibDepth = actx.createGain();
  vibDepth.gain.value = 7;
  vib.connect(vibDepth);
  vib.start(t0);

  /* Sustained drone: C3 (two slightly detuned) + G3, slow tremolo */
  const droneGain = actx.createGain();
  droneGain.gain.value = 0.035;
  const droneLP = actx.createBiquadFilter();
  droneLP.type = 'lowpass'; droneLP.frequency.value = 900;
  droneGain.connect(droneLP); droneLP.connect(out);

  const nodes = [vib];
  [[130.81, 0], [130.81, 3], [196.00, 0]].forEach(([f, cents]) => {
    const o = actx.createOscillator();
    o.type = 'sine'; o.frequency.value = f; o.detune.value = cents;
    o.connect(droneGain); o.start(t0);
    nodes.push(o);
  });
  const trem = actx.createOscillator();
  trem.frequency.value = 0.13;
  const tremDepth = actx.createGain();
  tremDepth.gain.value = 0.015;
  trem.connect(tremDepth); tremDepth.connect(droneGain.gain);
  trem.start(t0);
  nodes.push(trem);

  proc = { out, vibDepth, nodes, step: 0, next: t0 + 0.15, timer: null };
  proc.timer = setInterval(scheduleMusic, 150);
  scheduleMusic();
}

function stopProceduralMusic() {
  if (!proc) return;
  const p = proc;
  proc = null;
  clearInterval(p.timer);
  if (actx) {
    const t = actx.currentTime;
    try {
      p.out.gain.cancelScheduledValues(t);
      p.out.gain.setValueAtTime(Math.max(0.0001, p.out.gain.value), t);
      p.out.gain.linearRampToValueAtTime(0.0001, t + 0.35);
    } catch (e) {}
  }
  setTimeout(() => {
    p.nodes.forEach(n => { try { n.stop(); } catch (e) {} });
    try { p.out.disconnect(); } catch (e) {}
  }, 500);
}