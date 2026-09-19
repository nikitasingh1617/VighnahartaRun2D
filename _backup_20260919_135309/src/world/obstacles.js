import { ctx } from '../core/canvas.js';
import { camera, state } from '../core/state.js';
import { GROUND_Y, PLATE_X } from '../core/config.js';
import { world } from '../core/state.js';
import { SCENES } from '../data/scenes.js';
import { DIFFICULTIES } from '../data/difficulties.js';
import { drawDiya } from './props.js';

export const obstacles = [];

export function buildObstacles(round) {
  obstacles.length = 0;
  const diff = DIFFICULTIES[state.difficulty];
  const scene = SCENES[state.scene];
  const startX = PLATE_X + 250;
  const endX = world.placeX - 250;
  const span = Math.max(200, endX - startX);
  const count = Math.floor(span / diff.obstacleGap) + round * diff.obstacleBonus;
  const gap = span / count;
  const airChance = diff.airChanceBase + (round - 1) * diff.airChanceStep;
  const groundTypes = scene.obstacles.ground;
  const airTypes = scene.obstacles.air;
  for (let i = 0; i < count; i++) {
    const cx = startX + gap * i + gap * 0.5;
    if (Math.random() < airChance) {
      const w = 44 + Math.random() * 20;
      const h = 22 + Math.random() * 6;
      const baseY = GROUND_Y - (65 + Math.random() * 12);
      obstacles.push({
        x: cx - w/2, y: baseY, w, h,
        type: airTypes[Math.floor(Math.random() * airTypes.length)],
        air: true, seed: Math.random() * 100
      });
    } else {
      const w = 32 + Math.random() * 24;
      const h = 28 + Math.random() * 22 + (round - 1) * 2;
      obstacles.push({
        x: cx - w/2, y: GROUND_Y - h, w, h,
        type: groundTypes[Math.floor(Math.random() * groundTypes.length)],
        air: false, seed: Math.random() * 100
      });
    }
  }
}

export function drawObstacles() {
  for (const o of obstacles) {
    switch (o.type) {
      case 'pot':        drawPot(o, '#a0522d', '#8b4425', '#c26a3a'); break;
      case 'claypot':    drawPot(o, '#c8642a', '#a04a14', '#ffb84d'); break;
      case 'matka':      drawPot(o, '#b87838', '#8c5420', '#e8c078'); break;
      case 'flowers':    drawFlowers(o, 'night'); break;
      case 'flowers_day':drawFlowers(o, 'day');   break;
      case 'bench':      drawBench(o); break;
      case 'stool':      drawStool(o); break;
      case 'lowwall':    drawLowWall(o); break;
      case 'basket':     drawBasket(o); break;
      case 'diya':       drawDiyaObstacle(o); break;
      case 'garland':    drawGarland(o); break;
      case 'bird':       drawBird(o); break;
      case 'bat':        drawBat(o); break;
      case 'lantern':    drawLantern(o); break;
      case 'butterfly':  drawButterfly(o); break;
      case 'kite':       drawKite(o); break;
      case 'sparkler':   drawSparkler(o); break;
    }
  }
}

function drawPot(o, colA, colB, colC) {
  const { x, w, h } = o, top = o.y;
  ctx.fillStyle = colA;
  ctx.beginPath(); ctx.ellipse(x + w/2, GROUND_Y - h * 0.42, w/2, h * 0.46, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = colB;
  ctx.beginPath(); ctx.ellipse(x + w/2, GROUND_Y - h * 0.42, w/2 - 4, h * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = colC; ctx.fillRect(x + w/2 - 9, top, 18, 9);
  ctx.fillStyle = colB;
  ctx.beginPath(); ctx.ellipse(x + w/2, top + 1, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
}

function drawFlowers(o, mode) {
  const { x, w, h } = o, top = o.y;
  ctx.fillStyle = mode === 'day' ? '#a87038' : '#b5651d';
  ctx.beginPath();
  ctx.moveTo(x + 4, top + h * 0.42);
  ctx.lineTo(x + w - 4, top + h * 0.42);
  ctx.lineTo(x + w - 8, GROUND_Y);
  ctx.lineTo(x + 8, GROUND_Y);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = mode === 'day' ? '#7a4a14' : '#8b4a14';
  ctx.fillRect(x + 2, top + h * 0.42 - 5, w - 4, 7);
  const cols = mode === 'day' ? ['#ff9d3a','#ffc44a','#ff7b1a'] : ['#ff8c1a','#ffb84d','#ff6f1a'];
  for (let i = 0; i < 7; i++) {
    const bx = x + 6 + (i % 4) * ((w - 12) / 3);
    const by = top + 2 + Math.floor(i / 4) * 10 + Math.sin(i) * 2;
    ctx.fillStyle = cols[i % 3];
    ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,190,0.85)';
    ctx.beginPath(); ctx.arc(bx, by, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#2e7d32';
  ctx.beginPath(); ctx.ellipse(x + 4, top + h * 0.4, 8, 4, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + w - 4, top + h * 0.4, 8, 4, 0.5, 0, Math.PI * 2); ctx.fill();
}

function drawBench(o) {
  const { x, w, h } = o, top = o.y;
  ctx.fillStyle = '#6b3f22'; ctx.fillRect(x, top, w, 9);
  ctx.fillStyle = '#8b5730'; ctx.fillRect(x, top, w, 3);
  ctx.fillStyle = '#54301a';
  ctx.fillRect(x + 5, top + 9, 7, h - 9);
  ctx.fillRect(x + w - 12, top + 9, 7, h - 9);
  ctx.fillStyle = '#6b3f22';
  ctx.fillRect(x + 2, top + h * 0.55, w - 4, 6);
}

function drawStool(o) {
  const { x, w, h } = o, top = o.y;
  ctx.fillStyle = '#8a5428';
  ctx.beginPath(); ctx.ellipse(x + w/2, top + 6, w/2, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6b3f22';
  ctx.fillRect(x + 4, top + 8, 6, h - 8);
  ctx.fillRect(x + w - 10, top + 8, 6, h - 8);
  ctx.fillStyle = 'rgba(255,240,200,0.3)';
  ctx.beginPath(); ctx.ellipse(x + w/2, top + 4, w/2 - 4, 3, 0, 0, Math.PI * 2); ctx.fill();
}

function drawLowWall(o) {
  const { x, w, h } = o, top = o.y;
  ctx.fillStyle = '#8a6a54'; ctx.fillRect(x, top, w, h);
  ctx.fillStyle = '#6a4a34';
  const rows = Math.max(2, Math.floor(h / 12));
  for (let r = 0; r < rows; r++) {
    const yy = top + r * (h / rows);
    for (let k = 0; k < 3; k++) {
      ctx.fillRect(x + (k * 18 + (r % 2) * 10) % w, yy + 1, 15, h / rows - 2);
    }
  }
  ctx.fillStyle = 'rgba(255,240,200,0.2)';
  ctx.fillRect(x, top, w, 2);
}

function drawBasket(o) {
  const { x, w, h } = o, top = o.y;
  ctx.fillStyle = '#a8783a';
  ctx.beginPath();
  ctx.moveTo(x + 4, top + h * 0.3);
  ctx.lineTo(x + w - 4, top + h * 0.3);
  ctx.lineTo(x + w - 6, GROUND_Y);
  ctx.lineTo(x + 6, GROUND_Y);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#6a4418'; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 6, top + h * 0.4 + i * (h * 0.5 / 5));
    ctx.lineTo(x + w - 6, top + h * 0.4 + i * (h * 0.5 / 5));
    ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 10 + i * (w - 20) / 4, top + h * 0.3);
    ctx.lineTo(x + 8 + i * (w - 16) / 4, GROUND_Y);
    ctx.stroke();
  }
  ctx.fillStyle = '#c88a48';
  ctx.beginPath(); ctx.ellipse(x + w/2, top + h * 0.3, w/2 - 4, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd24a';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(x + w * 0.3 + i * w * 0.2, top + 2, 5, 0, Math.PI * 2); ctx.fill();
  }
}

function drawDiyaObstacle(o) {
  const { x, w, h } = o, top = o.y;
  ctx.fillStyle = '#7a4a2a';
  ctx.fillRect(x + w/2 - 5, top + 16, 10, h - 16);
  ctx.fillStyle = '#a0522d';
  ctx.beginPath(); ctx.ellipse(x + w/2, GROUND_Y, w/2 + 3, 5, 0, 0, Math.PI * 2); ctx.fill();
  drawDiya(x + w/2, top + 16, 1.05);
}

function drawGarland(o) {
  const { x, w, h } = o, top = o.y;
  ctx.fillStyle = '#5a3018';
  ctx.fillRect(x + w/2 - 3, top, 6, h);
  for (let i = 0; i < Math.floor(h / 12); i++) {
    const yy = top + 8 + i * 12;
    ctx.fillStyle = i % 2 === 0 ? '#ff8c1a' : '#ffb84d';
    ctx.beginPath(); ctx.arc(x + w/2, yy, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,180,0.85)';
    ctx.beginPath(); ctx.arc(x + w/2 - 1, yy - 2, 2.4, 0, Math.PI * 2); ctx.fill();
  }
}

function drawBird(o) {
  const cx = o.x + o.w/2, cy = o.y + o.h/2;
  const flap = Math.sin(camera.time * 12 + o.seed) * 10;
  ctx.fillStyle = '#2a1a0f';
  ctx.beginPath(); ctx.ellipse(cx, cy, o.w * 0.35, o.h * 0.45, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4a2e18';
  ctx.beginPath(); ctx.ellipse(cx - o.w * 0.30, cy - flap, o.w * 0.28, 5, -0.45, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + o.w * 0.30, cy - flap, o.w * 0.28, 5, 0.45, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c1008';
  ctx.beginPath();
  ctx.moveTo(cx - o.w * 0.35, cy);
  ctx.lineTo(cx - o.w * 0.55, cy - 5);
  ctx.lineTo(cx - o.w * 0.55, cy + 5);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a2210';
  ctx.beginPath(); ctx.arc(cx + o.w * 0.34, cy - 2, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffae1a';
  ctx.beginPath();
  ctx.moveTo(cx + o.w * 0.42, cy - 2);
  ctx.lineTo(cx + o.w * 0.52, cy);
  ctx.lineTo(cx + o.w * 0.42, cy + 2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(cx + o.w * 0.36, cy - 3, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(cx + o.w * 0.36, cy - 3, 0.7, 0, Math.PI * 2); ctx.fill();
}

function drawBat(o) {
  const cx = o.x + o.w/2, cy = o.y + o.h/2;
  const flap = Math.sin(camera.time * 10 + o.seed) * 12;
  ctx.fillStyle = '#1a0a14';
  ctx.beginPath(); ctx.ellipse(cx, cy, o.w * 0.32, o.h * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - o.w * 0.15, cy);
  ctx.quadraticCurveTo(cx - o.w * 0.55, cy - flap - 10, cx - o.w * 0.60, cy + 2);
  ctx.quadraticCurveTo(cx - o.w * 0.40, cy + 2, cx - o.w * 0.15, cy + 2);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + o.w * 0.15, cy);
  ctx.quadraticCurveTo(cx + o.w * 0.55, cy - flap - 10, cx + o.w * 0.60, cy + 2);
  ctx.quadraticCurveTo(cx + o.w * 0.40, cy + 2, cx + o.w * 0.15, cy + 2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff3838';
  ctx.beginPath(); ctx.arc(cx - o.w * 0.10, cy - 2, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + o.w * 0.10, cy - 2, 1.4, 0, Math.PI * 2); ctx.fill();
}

function drawLantern(o) {
  const cx = o.x + o.w/2, cy = o.y + o.h/2;
  const sway = Math.sin(camera.time * 2.2 + o.seed) * 3;
  ctx.strokeStyle = 'rgba(90,60,40,0.75)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx + sway, cy - o.h/2); ctx.stroke();
  const g = ctx.createRadialGradient(cx + sway, cy, 4, cx + sway, cy, o.w * 1.4);
  g.addColorStop(0, 'rgba(255,200,80,0.75)');
  g.addColorStop(1, 'rgba(255,200,80,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx + sway, cy, o.w * 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c62828';
  ctx.beginPath(); ctx.ellipse(cx + sway, cy, o.w/2, o.h/2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(cx + sway, cy - o.h/2 + 3, o.w/2, 3, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx + sway, cy + o.h/2 - 3, o.w/2, 3, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx + sway, cy, o.w/2, o.h/2, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ffd24a';
  ctx.beginPath();
  ctx.moveTo(cx + sway - 4, cy + o.h/2);
  ctx.lineTo(cx + sway + 4, cy + o.h/2);
  ctx.lineTo(cx + sway, cy + o.h/2 + 9);
  ctx.closePath(); ctx.fill();
}

function drawButterfly(o) {
  const cx = o.x + o.w/2, cy = o.y + o.h/2;
  const flap = Math.abs(Math.sin(camera.time * 8 + o.seed));
  const col = ['#ff8ac8','#ffd24a','#8ad8ff','#ff8a5a'][Math.floor(o.seed) % 4];
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(camera.time * 2 + o.seed) * 0.3);
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(-8 * flap, -3, 8 * flap + 2, 8, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( 8 * flap, -3, 8 * flap + 2, 8,  0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-6 * flap, 5, 6 * flap + 2, 6, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( 6 * flap, 5, 6 * flap + 2, 6,  0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a0a14';
  ctx.beginPath(); ctx.ellipse(0, 0, 2, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawKite(o) {
  const cx = o.x + o.w/2, cy = o.y + o.h/2;
  const sway = Math.sin(camera.time * 1.6 + o.seed) * 6;
  ctx.strokeStyle = 'rgba(90,60,40,0.6)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx + sway, 0); ctx.lineTo(cx, cy - o.h/2); ctx.stroke();
  const col = ['#ff5b5b','#5bb8ff','#ffd24a','#5bff9d'][Math.floor(o.seed) % 4];
  ctx.save();
  ctx.translate(cx + sway, cy);
  ctx.rotate(Math.sin(camera.time * 2 + o.seed) * 0.15);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(0, -o.h/2);
  ctx.lineTo(o.w/2, 0);
  ctx.lineTo(0, o.h/2);
  ctx.lineTo(-o.w/2, 0);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -o.h/2); ctx.lineTo(0, o.h/2);
  ctx.moveTo(-o.w/2, 0); ctx.lineTo(o.w/2, 0);
  ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, o.h/2);
  ctx.quadraticCurveTo(8, o.h/2 + 10, -4, o.h/2 + 20);
  ctx.stroke();
  ctx.restore();
}

function drawSparkler(o) {
  const cx = o.x + o.w/2, cy = o.y + o.h/2;
  ctx.strokeStyle = 'rgba(90,60,40,0.75)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, cy); ctx.stroke();
  const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, o.w * 1.6);
  g.addColorStop(0, 'rgba(255,240,180,0.95)');
  g.addColorStop(0.4, 'rgba(255,180,80,0.5)');
  g.addColorStop(1, 'rgba(255,140,60,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, o.w * 1.6, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 8; i++) {
    const a = i * (Math.PI * 2 / 8) + camera.time * 2 + o.seed;
    const rr = o.w * 0.55 + Math.sin(camera.time * 8 + i) * 4;
    const sx = cx + Math.cos(a) * rr;
    const sy = cy + Math.sin(a) * rr;
    ctx.fillStyle = '#fff2a8';
    ctx.beginPath(); ctx.arc(sx, sy, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#ffd24a';
  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
}