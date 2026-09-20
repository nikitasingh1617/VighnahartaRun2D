import { state } from '../core/state.js';
import { DIFFICULTIES } from '../data/difficulties.js';
import { playBell, playDrum, playDrumRoll } from '../core/audio.js';

/* ------------------------------------------------------------
   DRUM TUNING — easy knobs (seconds / volume)
   ------------------------------------------------------------ */
const GREEN_BEAT_VOL   = 0.26;  // dhol beat while running        (louder than before — the old one was very faint)
const GREEN_BEAT_EVERY = 0.55;  // gap between running beats      (unchanged)
const RESUME_BEAT_VOL  = 0.30;  // beat when the aarti ends
const ROLL_EVERY_START = 0.32;  // gap between roll hits at the START of the warning (was 0.42)
const ROLL_EVERY_END   = 0.20;  // ...and at the END, right before the bell         (was 0.10 — far too frantic)
/* Roll hit VOLUME is in core/audio.js (ROLL_VOL_START / ROLL_VOL_END). */

export const LIGHT_INFO = {
  green: { c:'#3ce86e', rgba:'60,232,110',  label:'DHOL!',     sub:'Green light — RUN!' },
  warn:  { c:'#ffbe1a', rgba:'255,190,26',  label:'DRUM ROLL',  sub:'Get ready to freeze!' },
  red:   { c:'#ff3838', rgba:'255,56,56',   label:'AARTI!',     sub:'HOLD [ALT] — do not move!' }
};

export function resetLightCycle() {
  state.lightPhase = 'green';
  state.lightT = 0;
  state.graceT = 0;
  state.beatT = 0.25;
}

export function updateLightCycle(dt) {
  const diff = DIFFICULTIES[state.difficulty];
  const cfg = diff.rounds[state.round - 1];

  state.lightT += dt;
  if (state.lightPhase === 'green') {
    if (state.lightT >= cfg.green) { state.lightPhase = 'warn'; state.lightT = 0; state.beatT = 0; }
  } else if (state.lightPhase === 'warn') {
    if (state.lightT >= cfg.warn) {
      state.lightPhase = 'red'; state.lightT = 0; state.graceT = diff.grace;
      playBell();
    }
  } else {
    if (state.graceT > 0) state.graceT -= dt;
  }

  if (state.lightPhase === 'green') {
    state.beatT -= dt;
    if (state.beatT <= 0) { playDrum(GREEN_BEAT_VOL); state.beatT = GREEN_BEAT_EVERY; }
  } else if (state.lightPhase === 'warn') {
    state.beatT -= dt;
    if (state.beatT <= 0) {
      const p = Math.min(1, state.lightT / cfg.warn);
      playDrumRoll(p);   /* swells louder as the bell gets closer */
      state.beatT = ROLL_EVERY_START - (ROLL_EVERY_START - ROLL_EVERY_END) * p;
    }
  }

  if (state.lightPhase === 'red' && state.lightT >= cfg.red) {
    state.lightPhase = 'green';
    state.lightT = 0;
    state.beatT = 0.25;
    playDrum(RESUME_BEAT_VOL);
  }
}