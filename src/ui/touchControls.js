import { ctx, W, H } from '../core/canvas.js';
import { state, ui, keys, player } from '../core/state.js';

const BTN_R = 28;

export const TOUCH_BUTTONS = [
  { id: 'left',     cx: 58,  cy: 465, r: BTN_R, key: 'ArrowLeft',  label: '◀' },
  { id: 'right',    cx: 122, cy: 465, r: BTN_R, key: 'ArrowRight', label: '▶' },
  { id: 'interact', cx: 718, cy: 465, r: BTN_R, key: 'e',          label: 'E' },
  { id: 'crouch',   cx: 784, cy: 465, r: BTN_R, key: 'ArrowDown',  label: '▼' },
  { id: 'jump',     cx: 850, cy: 465, r: BTN_R, key: 'ArrowUp',    label: '▲' },
  { id: 'aarti',    cx: 916, cy: 465, r: BTN_R, key: 'Alt',        label: 'ALT', isAlt: true },
];

export const PAUSE_BUTTON = {
  id: 'pause', cx: 265, cy: 48, r: 18,
  label: '⏸', oneShot: true, action: 'pause'
};

export function hitTestTouchButton(x, y) {
  if (state.mode !== 'playing') return null;

  const dp = Math.hypot(x - PAUSE_BUTTON.cx, y - PAUSE_BUTTON.cy);
  if (dp <= PAUSE_BUTTON.r + 8) return PAUSE_BUTTON;

  for (const btn of TOUCH_BUTTONS) {
    const d = Math.hypot(x - btn.cx, y - btn.cy);
    if (d <= btn.r + 6) return btn;
  }
  return null;
}

export function pressTouchButton(btn, pointerId) {
  if (btn.oneShot) {
    if (btn.action === 'pause') {
      if (state.mode === 'playing') {
        state.mode = 'paused';
        for (const k in keys) keys[k] = false;
      }
    }
    return;
  }

  keys[btn.key] = true;
  if (btn.key === 'ArrowLeft')  keys['a'] = true;
  if (btn.key === 'ArrowRight') keys['d'] = true;
  if (btn.key === 'ArrowUp')  { keys['w'] = true; keys[' '] = true; }
  if (btn.key === 'ArrowDown')  keys['s'] = true;
  if (btn.key === 'Alt')        keys['alt'] = true;

  /* E button → fire the one-shot interact flag the game actually reads */
  if (btn.key === 'e') {
    keys['E'] = true;
    player.interactRequested = true;
  }

  ui.activePointers.set(pointerId, btn);
  ui.touchPressed[btn.id] = true;
}

export function releaseTouchButton(pointerId) {
  const btn = ui.activePointers.get(pointerId);
  if (!btn) return;

  keys[btn.key] = false;
  if (btn.key === 'ArrowLeft')  keys['a'] = false;
  if (btn.key === 'ArrowRight') keys['d'] = false;
  if (btn.key === 'ArrowUp')  { keys['w'] = false; keys[' '] = false; }
  if (btn.key === 'ArrowDown')  keys['s'] = false;
  if (btn.key === 'Alt')        keys['alt'] = false;
  if (btn.key === 'e')          keys['E'] = false;

  ui.activePointers.delete(pointerId);
  ui.touchPressed[btn.id] = false;
}

export function releaseAllTouchButtons() {
  for (const [pointerId, btn] of ui.activePointers) {
    keys[btn.key] = false;
    ui.touchPressed[btn.id] = false;
  }
  ui.activePointers.clear();
}

export function drawTouchControls() {
  if (!ui.hasTouch) return;
  if (state.mode !== 'playing') return;

  drawTouchBtn(PAUSE_BUTTON, ui.touchPressed[PAUSE_BUTTON.id]);
  for (const btn of TOUCH_BUTTONS) {
    drawTouchBtn(btn, ui.touchPressed[btn.id]);
  }
}

function drawTouchBtn(btn, pressed) {
  const { cx, cy, r, label, isAlt } = btn;

  if (pressed) {
    const g = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.7);
    g.addColorStop(0, 'rgba(255,210,74,0.55)');
    g.addColorStop(1, 'rgba(255,210,74,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.7, 0, Math.PI * 2); ctx.fill();
  }

  ctx.fillStyle = pressed
    ? 'rgba(255,210,74,0.72)'
    : 'rgba(255,250,240,0.85)';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = pressed
    ? 'rgba(120,60,10,1)'
    : 'rgba(232,160,32,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

  ctx.strokeStyle = pressed
    ? 'rgba(255,255,255,0.7)'
    : 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, r - 4, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = pressed ? '#7a3a00' : '#a05808';
  ctx.font = isAlt
    ? 'bold 15px system-ui, sans-serif'
    : (btn.id === 'pause' ? 'bold 18px system-ui, sans-serif' : 'bold 22px system-ui, sans-serif');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 1);
}