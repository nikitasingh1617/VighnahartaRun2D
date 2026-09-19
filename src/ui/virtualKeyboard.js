import { ctx, W } from '../core/canvas.js';
import { save, persistSave } from '../core/save.js';
import { ui } from '../core/state.js';
import { rrect } from '../util/drawing.js';

/* ---- Layout constants ---- */
const KEY_W = 46;
const KEY_H = 42;
const KEY_GAP = 6;
const CAPS_W = 62;
const BACKSPACE_W = 86;

const ROW_1_Y = 224;
const ROW_2_Y = 276;
const ROW_3_Y = 328;
const ROW_4_Y = 380;

const ROW_1 = ['Q','W','E','R','T','Y','U','I','O','P'];
const ROW_2 = ['A','S','D','F','G','H','J','K','L'];
const ROW_3 = ['CAPS','Z','X','C','V','B','N','M','BKSP'];
const SPACE_W = 320;

let pressedKey = null;
let capsOn = true;

/* ---- Layout helper ---- */
function layoutRow(keys, widths, y) {
  const totalW = keys.reduce(
    (sum, k, i) => sum + widths[i] + (i > 0 ? KEY_GAP : 0),
    0
  );
  let x = W / 2 - totalW / 2;
  const rects = [];
  for (let i = 0; i < keys.length; i++) {
    rects.push({ key: keys[i], x, y: y - KEY_H / 2, w: widths[i], h: KEY_H });
    x += widths[i] + KEY_GAP;
  }
  return rects;
}

export function getKeyRects() {
  const rects = [];

  rects.push(...layoutRow(ROW_1, ROW_1.map(_ => KEY_W), ROW_1_Y));
  rects.push(...layoutRow(ROW_2, ROW_2.map(_ => KEY_W), ROW_2_Y));

  const row3Widths = ROW_3.map(k => {
    if (k === 'CAPS') return CAPS_W;
    if (k === 'BKSP') return BACKSPACE_W;
    return KEY_W;
  });
  rects.push(...layoutRow(ROW_3, row3Widths, ROW_3_Y));

  /* Row 4 — space bar */
  rects.push({
    key: 'SPACE',
    x: W / 2 - SPACE_W / 2,
    y: ROW_4_Y - KEY_H / 2,
    w: SPACE_W,
    h: KEY_H
  });

  return rects;
}

export function hitTestKeyboard(mx, my) {
  for (const r of getKeyRects()) {
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return r;
  }
  return null;
}

export function pressKeyboardKey(key) {
  /* CAPS toggle — does not type anything */
  if (key === 'CAPS') {
    capsOn = !capsOn;
    pressedKey = key;
    setTimeout(() => { if (pressedKey === key) pressedKey = null; }, 120);
    return;
  }

  /* Backspace */
  if (key === 'BKSP') {
    save.playerName = (save.playerName || '').slice(0, -1);
    persistSave();
    pressedKey = key;
    setTimeout(() => { if (pressedKey === key) pressedKey = null; }, 120);
    return;
  }

  /* Space */
  if (key === 'SPACE') {
    if ((save.playerName || '').length < 14) {
      save.playerName = (save.playerName || '') + ' ';
      persistSave();
    }
    pressedKey = key;
    setTimeout(() => { if (pressedKey === key) pressedKey = null; }, 120);
    return;
  }

  /* Letter */
  if ((save.playerName || '').length < 14) {
    const ch = capsOn ? key.toUpperCase() : key.toLowerCase();
    save.playerName = (save.playerName || '') + ch;
    persistSave();
  }
  pressedKey = key;
  setTimeout(() => { if (pressedKey === key) pressedKey = null; }, 120);
}

export function drawKeyboard() {
  const rects = getKeyRects();
  for (const r of rects) {
    const isCaps = r.key === 'CAPS';
    const isSpace = r.key === 'SPACE';
    const isBksp = r.key === 'BKSP';
    const pressed = pressedKey === r.key;
    const capsActive = isCaps && capsOn;

    /* Background */
    let bg;
    if (pressed) bg = 'rgba(255,210,74,0.55)';
    else if (capsActive) bg = 'rgba(255,210,74,0.28)';
    else bg = 'rgba(28,14,20,0.85)';
    ctx.fillStyle = bg;
    rrect(r.x, r.y, r.w, r.h, 8);
    ctx.fill();

    /* Border */
    ctx.strokeStyle = (pressed || capsActive) ? '#ffd24a' : 'rgba(255,210,90,0.5)';
    ctx.lineWidth = (pressed || capsActive) ? 2.2 : 1.4;
    rrect(r.x, r.y, r.w, r.h, 8);
    ctx.stroke();

    /* Content */
    if (isSpace) {
      /* Draw a small horizontal bar to represent space */
      ctx.fillStyle = pressed ? '#fff8d0' : '#ffd24a';
      ctx.fillRect(r.x + r.w / 2 - 28, r.y + r.h / 2 - 1.5, 56, 3);
      continue;
    }

    let label;
    if (isCaps) label = 'CAPS';
    else if (isBksp) label = '\u232B';    // ⌫
    else label = capsOn ? r.key : r.key.toLowerCase();

    let font;
    if (isCaps) font = 'bold 13px system-ui, sans-serif';
    else if (isBksp) font = 'bold 22px system-ui, sans-serif';
    else font = 'bold 17px system-ui, sans-serif';

    ctx.fillStyle = (pressed || capsActive) ? '#fff8d0' : '#ffd24a';
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 1);
  }
}