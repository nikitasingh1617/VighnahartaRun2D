import { state, keys, player, ui } from './state.js';
import { initAudio } from './audio.js';
import { save, persistSave } from './core/save.js';
import { screenToCanvas } from '../util/drawing.js';
import { hitTestButton, handleButton } from '../ui/registry.js';
import { processCheatKey } from '../cheats.js';
import { cvs, W } from './canvas.js';
import {
  hitTestTouchButton,
  pressTouchButton,
  releaseTouchButton,
  releaseAllTouchButtons
} from '../ui/touchControls.js';
import { hitTestKeyboard, pressKeyboardKey } from '../ui/virtualKeyboard.js';

function isInteractHeld() { return !!keys['e'] || !!keys['E']; }
function isScrollMode() {
  return state.mode === 'instructions' || state.mode === 'intro';
}
function clampScroll(v) {
  return Math.max(0, Math.min(state.instructionsMaxScroll, v));
}

/* ---- Fullscreen state ---- */
let fullscreenOK = false;
let lastFsTry = 0;

function requestFullscreen() {
  if (fullscreenOK) return;
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    fullscreenOK = true;
    return;
  }

  /* Throttle: at most one attempt every 800 ms */
  const now = performance.now();
  if (now - lastFsTry < 800) return;
  lastFsTry = now;

  try {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      const p = el.requestFullscreen({ navigationUI: 'hide' });
      if (p && p.catch) p.catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  } catch (e) {}

  try {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
  } catch (e) {}
}

export function installInput() {
  /* Track fullscreen status */
  const onFsChange = () => {
    fullscreenOK = !!(document.fullscreenElement || document.webkitFullscreenElement);
  };
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);

  /* ---- First tap anywhere → fullscreen ---- */
  const firstTap = e => {
    if (!ui.hasTouch) return;
    requestFullscreen();
    state.fullscreenToast = 2.5;
    document.removeEventListener('pointerdown', firstTap);
    document.removeEventListener('touchstart', firstTap);
  };
  document.addEventListener('pointerdown', firstTap, { passive: true });
  document.addEventListener('touchstart',  firstTap, { passive: true });

  /* ---- Wheel scroll ---- */
  cvs.addEventListener('wheel', e => {
    if (!isScrollMode()) return;
    e.preventDefault();
    const step = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    state.instructionsScrollTarget = clampScroll(state.instructionsScrollTarget + step);
  }, { passive: false });

  /* ---- Touch drag scroll ---- */
  let touchStartY = null;
  let touchStartTarget = 0;
  cvs.addEventListener('touchstart', e => {
    if (!isScrollMode()) return;
    touchStartY = e.touches[0].clientY;
    touchStartTarget = state.instructionsScrollTarget;
  }, { passive: true });
  cvs.addEventListener('touchmove', e => {
    if (touchStartY === null || !isScrollMode()) return;
    e.preventDefault();
    const dy = (touchStartY - e.touches[0].clientY) * 1.6;
    state.instructionsScrollTarget = clampScroll(touchStartTarget + dy);
  }, { passive: false });
  cvs.addEventListener('touchend', () => { touchStartY = null; }, { passive: true });

  /* ---- Keyboard ---- */
  window.addEventListener('keydown', e => {
    const k = e.key;
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(k)) e.preventDefault();
    if (k === 'Alt') e.preventDefault();
    keys[k] = true; keys[k.toLowerCase()] = true;
    if (e.altKey) keys['Alt'] = true;
    initAudio();

    if (k.length === 1 && /[a-zA-Z]/.test(k)) processCheatKey(k);

    if (k === 'm' || k === 'M') {
      import('./audio.js').then(a => {
        const nowMuted = a.toggleMute();
        state.muteToastMsg = nowMuted ? 'SOUND OFF' : 'SOUND ON';
        state.muteToast = 1.6;
      });
      return;
    }

    if (state.mode === 'nameEntry') {
      if (k === 'Backspace') {
        save.playerName = (save.playerName || '').slice(0, -1);
        persistSave(); return;
      }
      if (k === 'Enter') {
        if (save.playerName.trim().length >= 1) {
          save.playerName = save.playerName.trim();
          persistSave();
          state.delivered = 0;
          import('../cloud.js').then(c => c.startGameWithCloudSync());
        }
        return;
      }
      if (k === 'Escape') { state.mode = 'diffSelect'; return; }
      if (k.length === 1 && /[a-zA-Z0-9 ]/.test(k) && (save.playerName || '').length < 14) {
        save.playerName = (save.playerName || '') + k;
        persistSave(); return;
      }
      return;
    }

    if (isScrollMode()) {
      if (k === 'ArrowDown' || k === 'PageDown') {
        state.instructionsScrollTarget = clampScroll(state.instructionsScrollTarget + 48);
        return;
      }
      if (k === 'ArrowUp' || k === 'PageUp') {
        state.instructionsScrollTarget = clampScroll(state.instructionsScrollTarget - 48);
        return;
      }
      if (k === 'Home') { state.instructionsScrollTarget = 0; return; }
      if (k === 'End')  { state.instructionsScrollTarget = state.instructionsMaxScroll; return; }
    }

    if (state.mode === 'intro') {
      if ((k === ' ' || k === 'Enter') && state.introT >= 3) {
        state.instructionsScrollY = 0;
        state.instructionsScrollTarget = 0;
        state.mode = 'sceneSelect';
      }
      return;
    }
    if (state.mode === 'instructions') {
      if (k === 'Escape' || k === 'Backspace') {
        state.instructionsScrollY = 0;
        state.instructionsScrollTarget = 0;
        state.mode = 'menu';
      }
      return;
    }
    if (state.mode === 'sceneSelect') {
      if (k === 'Escape' || k === 'Backspace') { state.mode = 'menu'; return; }
      if (k === '1' && save.unlockedScenes.night)   { state.scene = 'night'; state.mode = 'diffSelect'; return; }
      if (k === '2' && save.unlockedScenes.day)     { state.scene = 'day';   state.mode = 'diffSelect'; return; }
      if (k === '3' && save.unlockedScenes.evening) { state.scene = 'evening'; state.mode = 'diffSelect'; return; }
      return;
    }
    if (state.mode === 'diffSelect') {
      if (k === 'Escape' || k === 'Backspace') { state.mode = 'sceneSelect'; return; }
      if (k === '1') { state.difficulty = 'easy';   state.mode = 'nameEntry'; return; }
      if (k === '2') { state.difficulty = 'medium'; state.mode = 'nameEntry'; return; }
      if (k === '3') { state.difficulty = 'hard';   state.mode = 'nameEntry'; return; }
      return;
    }
    if (state.mode === 'leaderboard' || state.mode === 'shop') {
      if (k === 'Escape' || k === 'Backspace') { state.mode = 'menu'; return; }
    }
    if (k === 'Escape' || k === 'p' || k === 'P') {
      if (state.mode === 'playing') {
        state.mode = 'paused';
        for (const kk in keys) keys[kk] = false;
        return;
      } else if (state.mode === 'paused') {
        state.mode = 'playing'; return;
      }
    }
    if (k === ' ' || k === 'Enter') handleConfirm();
    if (k === 'Escape') {
      if (state.mode === 'menu') state.mode = 'exit';
      else if (state.mode === 'exit') state.mode = 'menu';
      else if (state.mode === 'win') state.mode = 'menu';
      else if (state.mode === 'caught') state.mode = 'menu';
    }
    if (isInteractHeld()) player.interactRequested = true;
  });

  window.addEventListener('keyup', e => {
    keys[e.key] = false; keys[e.key.toLowerCase()] = false;
    if (!e.altKey) keys['Alt'] = false;
  });

  window.addEventListener('blur', () => {
    for (const k in keys) keys[k] = false;
    releaseAllTouchButtons();
    if (state.mode === 'playing') state.mode = 'paused';
  });

  /* ---- Pointer ---- */
  cvs.addEventListener('pointerdown', e => {
    initAudio();

    /* Retry fullscreen on every tap until it succeeds.
       Fires synchronously — preserves the user gesture. */
    if (ui.hasTouch && !fullscreenOK) {
      requestFullscreen();
      state.fullscreenToast = 2.5;
    }

    const p = screenToCanvas(e.clientX, e.clientY);

    /* Name-entry keyboard */
    if (state.mode === 'nameEntry') {
      const keyHit = hitTestKeyboard(p.x, p.y);
      if (keyHit) {
        pressKeyboardKey(keyHit.key);
        return;
      }
    }

    /* Gameplay touch controls */
    if (state.mode === 'playing') {
      const touchBtn = hitTestTouchButton(p.x, p.y);
      if (touchBtn) {
        e.preventDefault();
        try { cvs.setPointerCapture(e.pointerId); } catch (err) {}
        pressTouchButton(touchBtn, e.pointerId);
        return;
      }
    }

    /* UI buttons */
    const btn = hitTestButton(p.x, p.y);
    if (btn) {
      handleButton(btn.id);
      return;
    }

    if (state.mode === 'playing') player.interactRequested = true;
  });

  cvs.addEventListener('pointerup', e => {
    releaseTouchButton(e.pointerId);
  });

  cvs.addEventListener('pointercancel', e => {
    releaseTouchButton(e.pointerId);
  });

  cvs.addEventListener('pointermove', e => {
    if (ui.hasTouch) return;
    if (ui.activePointers.has(e.pointerId)) return;
    const p = screenToCanvas(e.clientX, e.clientY);
    ui.mouseX = p.x; ui.mouseY = p.y;
    const btn = hitTestButton(p.x, p.y);
    ui.hoveredId = btn ? btn.id : null;
    cvs.style.cursor = btn ? 'pointer' : 'default';
  });

  cvs.addEventListener('pointerleave', () => {
    ui.hoveredId = null;
    cvs.style.cursor = 'default';
  });

  cvs.addEventListener('gesturestart', e => e.preventDefault());
  cvs.addEventListener('dblclick', e => e.preventDefault());
  cvs.addEventListener('contextmenu', e => e.preventDefault());
}

function handleConfirm() {
  if (state.mode === 'menu') {
    state.mode = 'intro'; state.introT = 0;
    state.instructionsScrollY = 0; state.instructionsScrollTarget = 0;
  }
  else if (state.mode === 'instructions') {
    state.mode = 'menu';
    state.instructionsScrollY = 0; state.instructionsScrollTarget = 0;
  }
  else if (state.mode === 'exit') { state.mode = 'menu'; }
  else if (state.mode === 'sceneSelect') { state.mode = 'menu'; }
  else if (state.mode === 'diffSelect') { state.mode = 'sceneSelect'; }
  else if (state.mode === 'leaderboard' || state.mode === 'shop') { state.mode = 'menu'; }
  else if (state.mode === 'paused') { state.mode = 'playing'; }
  else if (state.mode === 'win' && state.winT >= 3.5) {
    import('../gameplay/rounds.js').then(m => { state.delivered = 0; m.startRound(1); });
  }
}