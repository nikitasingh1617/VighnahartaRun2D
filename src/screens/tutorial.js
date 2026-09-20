import { ctx, W } from '../core/canvas.js';
import { camera, state, ui, keys } from '../core/state.js';
import { save } from '../core/save.js';
import { OUTFITS } from '../data/outfits.js';
import { TUTORIAL_PAGES } from '../core/config.js';
import { drawMenuBackground } from './_background.js';
import { drawOrnateLine, drawCornerFlourish, rrect } from '../util/drawing.js';
import { drawButtons } from '../ui/buttons.js';
import { drawMiniCharacter } from '../player/draw.js';
import { drawModak } from '../world/props.js';

/* ============================================================
   ONE-TIME TUTORIAL
   Shown once (save.tutorialDone), right before the very first run.
   Every page is animated and, on desktop, the on-screen keys light up
   when the player presses them — so they can try the controls right here.
   Navigation: NEXT button / Enter  ·  BACK button / Esc  ·  SKIP button
   ============================================================ */

const GOLD = '#ffd24a';
const PX = 50, PY = 62, PW = W - 100, PH = 380;   // main panel
const GY = 296;                                    // ground line for illustrations

function hero() { return OUTFITS[save.selectedOutfit] || OUTFITS.classic; }

const isDown = names => names.some(n => keys[n] || keys[String(n).toLowerCase()]);

/* ---------- small drawing helpers ---------- */
function wrapLines(text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function label(text, x, y, color, size, weight, align, family) {
  ctx.fillStyle = color;
  ctx.font = (weight || 'bold') + ' ' + (size || 12) + 'px ' + (family || 'system-ui, sans-serif');
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function keycap(cx, cy, text, w, pressed) {
  const h = 30;
  const x = cx - w / 2, y = cy - h / 2 + (pressed ? 2 : 0);
  ctx.save();
  ctx.shadowColor = pressed ? GOLD : 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = pressed ? 18 : 6;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  if (pressed) { g.addColorStop(0, '#fff2b0'); g.addColorStop(1, '#f0b510'); }
  else         { g.addColorStop(0, 'rgba(78,36,22,1)'); g.addColorStop(1, 'rgba(32,12,10,1)'); }
  ctx.fillStyle = g;
  rrect(x, y, w, h, 7); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = pressed ? '#fff8d0' : 'rgba(255,210,90,0.8)';
  ctx.lineWidth = 1.5;
  rrect(x, y, w, h, 7); ctx.stroke();
  label(text, cx, cy + (pressed ? 3 : 1), pressed ? '#3a1c00' : GOLD, 13, 'bold');
  ctx.restore();
}

/* One control shown the right way for the device:
   desktop → row of key caps that light up when pressed
   touch   → the round on-screen button used in-game                    */
function drawControl(cx, cy, spec) {
  if (ui.hasTouch) {
    const pulse = 0.5 + 0.5 * Math.sin(camera.time * 4);
    ctx.save();
    ctx.shadowColor = GOLD; ctx.shadowBlur = 8 + pulse * 12;
    ctx.fillStyle = 'rgba(30,14,10,0.92)';
    ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.stroke();
    label(spec.touch, cx, cy + 1, GOLD, spec.touch.length > 2 ? 15 : 20, 'bold');
    ctx.restore();
    return;
  }
  ctx.font = 'bold 13px system-ui, sans-serif';
  const widths = spec.keys.map(k => Math.max(34, ctx.measureText(k.l).width + 24));
  const gap = 8;
  const total = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
  let x = cx - total / 2;
  spec.keys.forEach((k, i) => {
    keycap(x + widths[i] / 2, cy, k.l, widths[i], isDown(k.n));
    x += widths[i] + gap;
  });
}

const CTL = {
  left:     { touch: '◀', keys: [{ l: 'A', n: ['a'] }, { l: '←', n: ['ArrowLeft'] }] },
  right:    { touch: '▶', keys: [{ l: 'D', n: ['d'] }, { l: '→', n: ['ArrowRight'] }] },
  jump:     { touch: '▲', keys: [{ l: 'W', n: ['w'] }, { l: '↑', n: ['ArrowUp'] }, { l: 'SPACE', n: [' '] }] },
  crouch:   { touch: '▼', keys: [{ l: 'S', n: ['s'] }, { l: '↓', n: ['ArrowDown'] }] },
  interact: { touch: 'E', keys: [{ l: 'E', n: ['e'] }] },
  aarti:    { touch: 'ALT', keys: [{ l: 'ALT', n: ['Alt', 'alt'] }] },
};

/* ---------- scene props ---------- */
function drawGround(x1, x2) {
  ctx.strokeStyle = 'rgba(255,210,120,0.25)'; ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath(); ctx.moveTo(x1, GY + 2); ctx.lineTo(x2, GY + 2); ctx.stroke();
  ctx.setLineDash([]);
}

function drawHero(x, feetY, s, opts = {}) {
  ctx.save();
  if (opts.flip) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
  if (opts.crouch) {
    ctx.translate(x, feetY); ctx.scale(1, 0.62); ctx.translate(-x, -feetY);
  }
  drawMiniCharacter(x, feetY - 15 * s, hero(), s);
  ctx.restore();
  if (opts.holding) drawModak(x + 4 * s, feetY - 30 * s, 0.9 * s, 0);
}

function drawPlate(x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(x, y + 4, 44, 9, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createLinearGradient(0, y - 8, 0, y + 6);
  g.addColorStop(0, '#ffe08a'); g.addColorStop(1, '#c8901c');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y, 42, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8a5a0c'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(x, y, 42, 9, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  drawModak(x - 18, y - 12, 0.85, -0.15);
  drawModak(x, y - 14, 0.9, 0);
  drawModak(x + 18, y - 12, 0.85, 0.15);
}

function drawPandal(x, y, s) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createLinearGradient(0, -80, 0, 0);
  g.addColorStop(0, '#7a1c1c'); g.addColorStop(1, '#3a0a0e');
  ctx.fillStyle = g;
  rrect(-52, -78, 104, 78, 6); ctx.fill();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
  rrect(-52, -78, 104, 78, 6); ctx.stroke();
  /* roof */
  ctx.fillStyle = '#ffb02e';
  ctx.beginPath(); ctx.moveTo(-64, -78); ctx.lineTo(0, -122); ctx.lineTo(64, -78); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#c47a10'; ctx.stroke();
  /* glowing inner arch */
  const gl = ctx.createRadialGradient(0, -38, 4, 0, -38, 34);
  gl.addColorStop(0, 'rgba(255,220,120,0.95)'); gl.addColorStop(1, 'rgba(255,160,40,0)');
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.arc(0, -38, 34, 0, Math.PI * 2); ctx.fill();
  label('ॐ', 0, -38, '#fff4c8', 26, 'bold', 'center', 'Georgia, serif');
  ctx.restore();
}

function drawRock(x, y) {
  ctx.save();
  const g = ctx.createLinearGradient(0, y - 26, 0, y);
  g.addColorStop(0, '#8d8577'); g.addColorStop(1, '#565046');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - 28, y); ctx.quadraticCurveTo(x - 26, y - 26, x - 6, y - 28);
  ctx.quadraticCurveTo(x + 22, y - 30, x + 28, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();
}

function drawBird(x, y) {
  const flap = Math.sin(camera.time * 10) * 7;
  ctx.save();
  ctx.fillStyle = '#3a2a4a';
  ctx.beginPath(); ctx.ellipse(x, y, 16, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x - 14, y - 3, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffb02e';
  ctx.beginPath(); ctx.moveTo(x - 19, y - 3); ctx.lineTo(x - 26, y - 1); ctx.lineTo(x - 19, y); ctx.fill();
  ctx.strokeStyle = '#5a4470'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 2, y - 3); ctx.lineTo(x + 6, y - 20 - flap); ctx.stroke();
  ctx.restore();
}

function drawLamp(x, y, r, color, rgba, on) {
  ctx.save();
  if (on) {
    const g = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.6);
    g.addColorStop(0, `rgba(${rgba},0.7)`); g.addColorStop(1, `rgba(${rgba},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = on ? 1 : 0.3;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function promptPill(x, y, text) {
  const pulse = 1 + Math.sin(camera.time * 6) * 0.04;
  ctx.save();
  ctx.translate(x, y); ctx.scale(pulse, pulse);
  const g = ctx.createRadialGradient(0, 0, 6, 0, 0, 78);
  g.addColorStop(0, 'rgba(255,210,74,0.38)'); g.addColorStop(1, 'rgba(255,210,74,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 78, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(18,8,26,0.92)';
  rrect(-100, -21, 200, 42, 21); ctx.fill();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
  rrect(-100, -21, 200, 42, 21); ctx.stroke();
  ctx.fillStyle = GOLD; rrect(-90, -15, 30, 30, 7); ctx.fill();
  label('E', -75, 0, '#1a0d05', 18, 'bold');
  label(text, -50, 0, GOLD, 16, 'bold', 'left');
  ctx.restore();
}

function chip(x, y, w, h, text, accent) {
  ctx.save();
  ctx.fillStyle = 'rgba(20,10,8,0.9)';
  rrect(x, y, w, h, 9); ctx.fill();
  ctx.strokeStyle = accent; ctx.lineWidth = 1.6;
  rrect(x, y, w, h, 9); ctx.stroke();
  label(text, x + w / 2, y + h / 2 + 1, accent, 11, 'bold', 'center', 'Georgia, serif');
  ctx.restore();
}

/* ============================================================
   PAGE ILLUSTRATIONS
   ============================================================ */
function pageMission() {
  const t = camera.time;
  drawGround(90, 870);
  drawPlate(190, GY - 4);
  drawPandal(760, GY, 1.15);
  label('PLATE', 190, GY + 22, GOLD, 12, 'bold');
  label('PANDAL', 760, GY + 22, GOLD, 12, 'bold');

  /* hero shuttles plate -> pandal carrying a modak */
  const cyc = (t % 6) / 6;
  const fwd = cyc < 0.5;
  const f = fwd ? cyc / 0.5 : 1 - (cyc - 0.5) / 0.5;
  const ease = f * f * (3 - 2 * f);
  const hx = 250 + ease * 420;
  const bob = Math.abs(Math.sin(t * 9)) * 4;
  drawHero(hx, GY - bob, 1.7, { flip: !fwd, holding: fwd });

  /* dotted route + arrows */
  ctx.strokeStyle = 'rgba(255,210,74,0.45)'; ctx.lineWidth = 2; ctx.setLineDash([3, 8]);
  ctx.beginPath(); ctx.moveTo(250, 176); ctx.lineTo(680, 176); ctx.stroke(); ctx.setLineDash([]);
  label('pick up  →  carry  →  offer  →  return', W / 2, 160, 'rgba(255,235,190,0.85)', 12, 'italic', 'center', 'Georgia, serif');

  /* modak count */
  for (let i = 0; i < 5; i++) drawModak(W / 2 - 60 + i * 30, 200, 0.9, 0);
  label('5 modaks per round', W / 2, 222, 'rgba(255,235,190,0.7)', 11, 'bold');
}

function pageRun() {
  const t = camera.time;
  drawGround(90, 870);
  const dir = Math.sin(t * 1.4);
  const hx = W / 2 + dir * 90;
  const bob = Math.abs(Math.sin(t * 9)) * 4;
  drawHero(hx, GY - bob, 1.9, { flip: Math.cos(t * 1.4) < 0 });

  /* speed streaks */
  ctx.strokeStyle = 'rgba(255,235,190,0.35)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  const back = Math.cos(t * 1.4) >= 0 ? -1 : 1;
  for (let i = 0; i < 3; i++) {
    const sy = GY - 30 - i * 22;
    ctx.beginPath(); ctx.moveTo(hx + back * 40, sy); ctx.lineTo(hx + back * (70 + i * 10), sy); ctx.stroke();
  }

  drawControl(300, 190, CTL.left);
  label('RUN LEFT', 300, 222, 'rgba(255,235,190,0.8)', 11, 'bold');
  drawControl(660, 190, CTL.right);
  label('RUN RIGHT', 660, 222, 'rgba(255,235,190,0.8)', 11, 'bold');
}

function pageJumpCrouch() {
  const t = camera.time;
  drawGround(90, 870);
  ctx.strokeStyle = 'rgba(255,210,120,0.2)'; ctx.lineWidth = 1; ctx.setLineDash([2, 6]);
  ctx.beginPath(); ctx.moveTo(W / 2, 120); ctx.lineTo(W / 2, GY + 10); ctx.stroke(); ctx.setLineDash([]);

  /* left: jump over a rock */
  const jc = (t % 2.4) / 2.4;
  const jx = 190 + jc * 200;
  const jy = jc > 0.25 && jc < 0.75 ? Math.sin((jc - 0.25) / 0.5 * Math.PI) * 70 : 0;
  drawRock(290, GY);
  drawHero(jx, GY - jy, 1.5);
  drawControl(290, 158, CTL.jump);
  label('JUMP over obstacles', 290, 190, 'rgba(255,235,190,0.85)', 12, 'bold');

  /* right: crouch under a bird */
  const cc = (t % 3.2) / 3.2;
  const birdX = 900 - cc * 320;
  const crouching = birdX > 600 && birdX < 760;
  drawBird(birdX, GY - 82);
  drawHero(680, GY, 1.5, { crouch: crouching });
  drawControl(680, 158, CTL.crouch);
  label('CROUCH under flyers', 680, 190, 'rgba(255,235,190,0.85)', 12, 'bold');
}

function pageInteract() {
  drawGround(90, 870);
  drawPlate(230, GY - 4);
  drawPandal(730, GY, 1.05);
  drawHero(300, GY, 1.5);
  drawHero(660, GY, 1.5, { holding: true });
  promptPill(230, 150, 'PICK UP MODAK');
  promptPill(730, 150, 'OFFER MODAK');
  label('at the plate', 230, GY + 22, GOLD, 11, 'bold');
  label('at the pandal', 730, GY + 22, GOLD, 11, 'bold');
  drawControl(W / 2, 205, CTL.interact);
  label('PRESS', W / 2, 176, 'rgba(255,235,190,0.7)', 11, 'bold');
}

function pageAarti() {
  const t = camera.time;
  const phase = Math.floor((t % 7.5) / 2.5);     // 0 green, 1 warn, 2 red
  const items = [
    { c: '#3ce86e', rgba: '60,232,110',  head: 'DHOL!',      sub: 'Green — RUN!' },
    { c: '#ffbe1a', rgba: '255,190,26',  head: 'DRUM ROLL',  sub: 'Get ready to freeze' },
    { c: '#ff3838', rgba: '255,56,56',   head: 'AARTI!',     sub: 'HOLD ALT — freeze!' },
  ];
  items.forEach((it, i) => {
    const cx = 200 + i * 280;
    const on = phase === i;
    drawLamp(cx, 175, 30, it.c, it.rgba, on);
    label(it.head, cx, 232, on ? it.c : 'rgba(255,235,190,0.5)', 17, 'bold', 'center', 'Georgia, serif');
    label(it.sub, cx, 254, on ? '#fff' : 'rgba(255,235,190,0.4)', 12, 'normal');
    if (i < 2) label('›', cx + 140, 175, 'rgba(255,210,74,0.5)', 30, 'bold');
  });
  /* hero reacts */
  const frozen = phase === 2;
  drawHero(W / 2, GY + 14, 1.15, { holding: true });
  if (frozen) drawControl(W / 2 + 120, GY - 20, CTL.aarti);
  else label('watch the light →', W / 2 + 120, GY - 20, 'rgba(255,235,190,0.55)', 11, 'italic', 'center', 'Georgia, serif');
}

function pageHud() {
  const t = camera.time;
  /* mock screen */
  ctx.fillStyle = 'rgba(8,4,14,0.6)';
  rrect(100, 122, 760, 186, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,74,0.25)'; ctx.lineWidth = 1;
  rrect(100, 122, 760, 186, 12); ctx.stroke();

  /* 1 — distance & coins panel */
  ctx.fillStyle = 'rgba(10,6,20,0.8)'; rrect(116, 136, 190, 54, 9); ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,74,0.6)'; ctx.lineWidth = 1.4; rrect(116, 136, 190, 54, 9); ctx.stroke();
  label('MEDIUM  R2/5', 130, 150, '#ffd24a', 10, 'bold', 'left');
  label('DISTANCE', 130, 174, 'rgba(255,210,74,0.9)', 10, 'bold', 'left');
  label('312m', 190, 174, GOLD, 15, 'bold', 'left', 'Georgia, serif');
  label('🪙 24', 296, 174, 'rgba(255,220,120,0.95)', 12, 'bold', 'right', 'Georgia, serif');

  /* 2 — light panel */
  const ph = Math.floor((t % 6) / 2);
  const L = [['#3ce86e', '60,232,110', 'DHOL!'], ['#ffbe1a', '255,190,26', 'DRUM ROLL'], ['#ff3838', '255,56,56', 'AARTI!']][ph];
  ctx.fillStyle = 'rgba(10,6,20,0.85)'; rrect(380, 132, 200, 62, 12); ctx.fill();
  ctx.strokeStyle = `rgba(${L[1]},0.8)`; ctx.lineWidth = 2; rrect(380, 132, 200, 62, 12); ctx.stroke();
  drawLamp(412, 163, 14, L[0], L[1], true);
  label(L[2], 440, 163, L[0], 17, 'bold', 'left');

  /* 3 — modak counter */
  ctx.fillStyle = 'rgba(10,6,20,0.8)'; rrect(660, 136, 176, 40, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,74,0.4)'; ctx.lineWidth = 1; rrect(660, 136, 176, 40, 10); ctx.stroke();
  for (let i = 0; i < 5; i++) { ctx.globalAlpha = i < 2 ? 1 : 0.22; drawModak(690 + i * 30, 156, 0.9, 0); }
  ctx.globalAlpha = 1;

  /* 4 — journey bar */
  ctx.fillStyle = 'rgba(10,6,20,0.8)'; rrect(140, 252, 680, 44, 10); ctx.fill();
  label('◀ PLATE', 160, 264, GOLD, 10, 'bold', 'left');
  label('PANDAL ▶', 800, 264, GOLD, 10, 'bold', 'right');
  const prog = (t % 5) / 5;
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; rrect(160, 275, 640, 10, 5); ctx.fill();
  const bg = ctx.createLinearGradient(160, 0, 800, 0);
  bg.addColorStop(0, '#3ce86e'); bg.addColorStop(0.7, '#ffbe1a'); bg.addColorStop(1, '#ff8c1a');
  ctx.fillStyle = bg; rrect(160, 275, 640 * prog, 10, 5); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(160 + 640 * prog, 280, 7, 0, Math.PI * 2); ctx.fill();

  /* 5 — pause button */
  ctx.fillStyle = 'rgba(20,10,8,0.9)'; ctx.beginPath(); ctx.arc(342, 163, 17, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(342, 163, 17, 0, Math.PI * 2); ctx.stroke();
  label('⏸', 342, 164, GOLD, 15, 'bold');

  /* numbered callouts */
  const call = (n, x, y) => {
    ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
    label(String(n), x, y + 1, '#1a0d05', 12, 'bold');
  };
  call(1, 116, 136); call(2, 380, 132); call(3, 836, 136); call(4, 140, 252); call(5, 359, 148);
}

function pageMenus() {
  const rows = [
    ['PLAY', '#ffd24a', 'Pick a scene & difficulty, then run'],
    ['INSTRUCTIONS', '#7ee0ff', 'Re-read the how-to any time'],
    ['LEADERBOARD', '#ffb84d', 'See the fastest runners online'],
    ['OUTFIT SHOP', '#c8a8ff', 'Spend coins on new outfits'],
    ['👤  PROFILE', '#ffd24a', 'Top-left icon: your stats & runs'],
    ['🔊  SOUND', '#a8e6a0', 'Turn music & effects on / off'],
    ['◀  BACK', '#ffd24a', 'Go to the previous page'],
    ['⏸  PAUSE', '#ff8a8a', 'In-game: resume, restart, menu'],
  ];
  const colX = [92, 500];
  rows.forEach((r, i) => {
    const col = i < 4 ? 0 : 1, row = i % 4;
    const x = colX[col], y = 126 + row * 46;
    chip(x, y, 138, 34, r[0], r[1]);
    label(r[2], x + 152, y + 18, 'rgba(255,240,215,0.9)', 12, 'normal', 'left');
  });
  label('EXIT closes the game from the main menu', W / 2, 314, 'rgba(255,235,190,0.45)', 11, 'italic', 'center', 'Georgia, serif');
}

function pageReady() {
  const t = camera.time;
  drawGround(90, 870);
  drawHero(W / 2, GY - Math.abs(Math.sin(t * 3)) * 6, 2.0);
  /* orbiting coins */
  for (let i = 0; i < 6; i++) {
    const a = t * 1.2 + i * (Math.PI * 2 / 6);
    const x = W / 2 + Math.cos(a) * 150, y = 210 + Math.sin(a) * 34;
    ctx.save();
    ctx.fillStyle = GOLD; ctx.strokeStyle = '#b07a10'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    label('₲', x, y + 1, '#8a5a0c', 11, 'bold', 'center', 'Georgia, serif');
    ctx.restore();
  }
  const name = (save.playerName || '').trim();
  if (name) label('Good luck, ' + name + '!', W / 2, 140, GOLD, 22, 'bold', 'center', 'Georgia, serif');
}

/* ============================================================
   PAGE TABLE  (keep length === TUTORIAL_PAGES in core/config.js)
   ============================================================ */
const PAGES = [
  { title: 'YOUR MISSION', accent: '168,230,160', draw: pageMission,
    kb: 'Carry 5 modaks to Bappa\u2019s pandal \u2014 one at a time. Pick one up at the plate, run to the pandal, offer it, then hurry back for the next.',
    touch: 'Carry 5 modaks to Bappa\u2019s pandal \u2014 one at a time. Pick one up at the plate, run to the pandal, offer it, then hurry back for the next.' },
  { title: 'RUN', accent: '126,224,255', draw: pageRun,
    kb: 'Move left and right along the road. Go on \u2014 press A / D or the arrow keys and watch them light up!',
    touch: 'Hold the \u25C0 and \u25B6 buttons at the bottom-left of the screen to run left and right.' },
  { title: 'JUMP & CROUCH', accent: '255,184,77', draw: pageJumpCrouch,
    kb: 'Obstacles block your path. Jump over (or onto) the ones on the ground, and crouch under anything that flies at head height. Jump: W / \u2191 / Space  \u00B7  Crouch: S / \u2193.',
    touch: 'Obstacles block your path. Tap \u25B2 to jump over the ones on the ground, and hold \u25BC to crouch under anything that flies at head height.' },
  { title: 'PICK UP & OFFER', accent: '255,210,74', draw: pageInteract,
    kb: 'Stand close to the plate or the pandal until the glowing prompt appears, then press E. Pick up at the plate \u2014 offer at the pandal.',
    touch: 'Stand close to the plate or the pandal until the glowing prompt appears, then tap the E button (bottom-right).' },
  { title: 'THE AARTI RULE', accent: '255,120,120', draw: pageAarti,
    kb: 'Drums roll, then the light turns RED and the bell rings. HOLD ALT and stay frozen! If you move or let go, all the modaks you carry are lost.',
    touch: 'Drums roll, then the light turns RED and the bell rings. HOLD the ALT button and stay frozen! If you move or let go, all the modaks you carry are lost.' },
  { title: 'READ THE SCREEN', accent: '126,224,255', draw: pageHud,
    kb: 'Keep an eye on the light and the journey bar while you run. Press ESC or P at any time to pause the game.',
    touch: 'Keep an eye on the light and the journey bar while you run. Tap \u23F8 at the top to pause the game.' },
  { title: 'MENUS & BUTTONS', accent: '200,168,255', draw: pageMenus,
    kb: 'Here is what every button does. You can always find them again from the main menu.',
    touch: 'Here is what every button does. You can always find them again from the main menu.' },
  { title: 'YOU\u2019RE READY!', accent: '168,230,160', draw: pageReady,
    kb: 'Grab coins on the road and spend them in the Outfit Shop. Finish a scene to unlock the next one. Your name is permanent \u2014 make it count!',
    touch: 'Grab coins on the road and spend them in the Outfit Shop. Finish a scene to unlock the next one. Your name is permanent \u2014 make it count!' },
];

/* ============================================================
   SCREEN
   ============================================================ */
export function drawTutorialScreen() {
  const page = Math.max(0, Math.min(TUTORIAL_PAGES - 1, state.tutorialPage || 0));
  const P = PAGES[page];

  drawMenuBackground();

  /* Panel */
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 10;
  const bg = ctx.createLinearGradient(0, PY, 0, PY + PH);
  bg.addColorStop(0, 'rgba(58,22,14,0.97)');
  bg.addColorStop(1, 'rgba(20,6,8,0.98)');
  ctx.fillStyle = bg; rrect(PX, PY, PW, PH, 20); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,200,90,1)'; ctx.lineWidth = 2.2;
  rrect(PX, PY, PW, PH, 20); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,200,90,0.35)'; ctx.lineWidth = 1;
  rrect(PX + 8, PY + 8, PW - 16, PH - 16, 14); ctx.stroke();
  drawCornerFlourish(PX + 22, PY + 22, 1, 1);
  drawCornerFlourish(PX + PW - 22, PY + 22, -1, 1);
  drawCornerFlourish(PX + 22, PY + PH - 22, 1, -1);
  drawCornerFlourish(PX + PW - 22, PY + PH - 22, -1, -1);

  /* Header */
  ctx.save();
  label('\u2726    Q U I C K   T U T O R I A L  \u00B7  ' + (page + 1) + ' / ' + TUTORIAL_PAGES + '    \u2726',
        W / 2, PY + 24, 'rgba(255,210,120,0.82)', 10, 'bold', 'center', 'Georgia, serif');
  const tg = ctx.createLinearGradient(0, PY + 36, 0, PY + 66);
  tg.addColorStop(0, '#fff6d0'); tg.addColorStop(0.5, GOLD); tg.addColorStop(1, '#e8a020');
  ctx.shadowColor = 'rgba(255,150,40,0.5)'; ctx.shadowBlur = 14;
  label(P.title, W / 2, PY + 52, tg, 28, 'bold', 'center', 'Georgia, serif');
  ctx.restore();
  drawOrnateLine(W / 2, PY + 72, 340, 'rgba(255,210,74,0.4)');

  /* Illustration */
  ctx.save();
  P.draw();
  ctx.restore();

  /* HUD legend (page 5) */
  if (page === 5) {
    const items = [
      ['1', 'Distance & coins'], ['2', 'The light \u2014 obey it!'], ['3', 'Modaks delivered'],
      ['4', 'Journey: plate \u2194 pandal'], ['5', 'Pause button'],
    ];
    const xs = [110, 340, 570, 110, 340];
    const ys = [322, 322, 322, 340, 340];
    items.forEach((it, i) => {
      ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(xs[i], ys[i], 8, 0, Math.PI * 2); ctx.fill();
      label(it[0], xs[i], ys[i] + 1, '#1a0d05', 10, 'bold');
      label(it[1], xs[i] + 14, ys[i] + 1, 'rgba(255,240,215,0.9)', 11.5, 'normal', 'left');
    });
  }

  /* Body text */
  ctx.save();
  ctx.font = '14px system-ui, sans-serif';
  const txt = ui.hasTouch ? P.touch : P.kb;
  const lines = wrapLines(txt, PW - 140);
  const by = page === 5 ? 374 : PY + 282;
  ctx.fillStyle = 'rgba(255,240,215,0.94)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.slice(0, 3).forEach((ln, i) => ctx.fillText(ln, W / 2, by + i * 22));
  ctx.restore();

  /* Page dots */
  for (let i = 0; i < TUTORIAL_PAGES; i++) {
    const dx = W / 2 - (TUTORIAL_PAGES - 1) * 9 + i * 18;
    ctx.fillStyle = i === page ? GOLD : 'rgba(255,210,120,0.28)';
    ctx.beginPath(); ctx.arc(dx, 458, i === page ? 4.5 : 3.2, 0, Math.PI * 2); ctx.fill();
  }

  drawButtons();

  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,235,190,0.4)';
  ctx.font = '11px system-ui, sans-serif';
  if (!ui.hasTouch) ctx.fillText('ENTER \u00B7 next        ESC \u00B7 previous', W / 2, 530);
  ctx.restore();
}
