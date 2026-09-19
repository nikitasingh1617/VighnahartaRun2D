import { ctx, W } from '../core/canvas.js';
import { save, persistSave } from '../core/save.js';
import { ui } from '../core/state.js';
import { rrect } from '../util/drawing.js';

const KEY_W = 46;
const KEY_H = 46;
const KEY_GAP = 6;
const BACKSPACE_W = 86;

const ROW_1_Y = 238;
const ROW_2_Y = 294;
const ROW_3_Y = 350;

const ROW_1 = ['Q','W','E','R','T','Y','U','I','O','P'];
const ROW_2 = ['A','S','D','F','G','H','J','K','L'];
const ROW_3 = ['Z','X','C','V','B','N','M','⌫'];

let pressedKey = null;

export function getKeyRects() {
  const rects = [];

  let row1W = ROW_1.length * KEY_W + (ROW_1.length - 1) * KEY_GAP;
  let x = W / 2 - row1W / 2;
  for (const k of ROW_1) {
    rects.push({ key: k, x, y: ROW_1_Y - KEY_H / 2, w: KEY_W, h: KEY_H });
    x += KEY_W + KEY_GAP;
  }

  const row2W = ROW_2.length * KEY_W + (ROW_2.length - 1) * KEY_GAP;
  x = W / 2 - row2W / 2;
  for (const k of ROW_2) {
    rects.push({ key: k, x, y: ROW_2_Y - KEY_H / 2, w: KEY_W, h: KEY_H });
    x += KEY_W + KEY_GAP;
  }

  let row3W = 0;
  for (const k of ROW_3) row3W += (k === '⌫' ? BACKSPACE_W : KEY_W) + KEY_GAP;
  row3W -= KEY_GAP;
  x = W / 2 - row3W / 2;
  for (const k of ROW_3) {
    const w = k === '⌫' ? BACKSPACE_W : KEY_W;
    rects.push({ key: k, x, y: ROW_3_Y - KEY_H / 2, w, h: KEY_H });
    x += w + KEY_GAP;
  }

  return rects;
}

export function hitTestKeyboard(mx, my) {
  for (const r of getKeyRects()) {
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return r;
  }
  return null;
}

export function pressKeyboardKey(key) {
  if (key === '⌫') {
    save.playerName = (save.playerName || '').slice(0, -1);
  } else if ((save.playerName || '').length < 14) {
    save.playerName = (save.playerName || '') + key;
  }
  persistSave();

  pressedKey = key;
  setTimeout(() => { if (pressedKey === key) pressedKey = null; }, 110);
}

export function drawKeyboard() {
  const rects = getKeyRects();
  for (const r of rects) {
    const pressed = pressedKey === r.key;

    ctx.fillStyle = pressed
      ? 'rgba(255,210,74,0.55)'
      : 'rgba(28,14,20,0.85)';
    rrect(r.x, r.y, r.w, r.h, 8);
    ctx.fill();

    ctx.strokeStyle = pressed
      ? '#ffd24a'
      : 'rgba(255,210,90,0.5)';
    ctx.lineWidth = pressed ? 2.2 : 1.4;
    rrect(r.x, r.y, r.w, r.h, 8);
    ctx.stroke();

    ctx.fillStyle = pressed ? '#fff8d0' : '#ffd24a';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(r.key, r.x + r.w / 2, r.y + r.h / 2 + 1);
  }
}