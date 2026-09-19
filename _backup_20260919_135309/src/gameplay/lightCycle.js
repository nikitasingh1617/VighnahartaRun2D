import { state } from '../core/state.js';
import { DIFFICULTIES } from '../data/difficulties.js';
import { playBell, playDrum } from '../core/audio.js';

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
    if (state.beatT <= 0) { playDrum(0.28); state.beatT = 0.55; }
  } else if (state.lightPhase === 'warn') {
    state.beatT -= dt;
    if (state.beatT <= 0) {
      playDrum(0.42);
      const p = Math.min(1, state.lightT / cfg.warn);
      state.beatT = 0.42 - 0.32 * p;
    }
  }

  if (state.lightPhase === 'red' && state.lightT >= cfg.red) {
    state.lightPhase = 'green';
    state.lightT = 0;
    state.beatT = 0.25;
    playDrum(0.32);
  }
}