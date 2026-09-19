import { ctx, W, H } from '../core/canvas.js';
import { camera, state } from '../core/state.js';
import { SCENES } from '../data/scenes.js';
import { GROUND_Y } from '../core/config.js';
import { world } from '../core/state.js';

const BG_MAX_X = 10500;

const stars = [];
for (let i = 0; i < 220; i++) {
  stars.push({
    x: Math.random() * (W + 200) - 100, y: Math.random() * 360,
    r: 0.35 + Math.random() * 1.6,
    p: Math.random() * Math.PI * 2, s: 0.5 + Math.random() * 2.0,
    hue: Math.random() < 0.15 ? 'warm' : 'cool'
  });
}

const clouds = [];
for (let i = 0; i < 8; i++) {
  clouds.push({
    x: Math.random() * (W + 400) - 200,
    y: 60 + Math.random() * 200,
    w: 200 + Math.random() * 260, h: 30 + Math.random() * 30,
    spd: 3 + Math.random() * 6,
    alpha: 0.10 + Math.random() * 0.10
  });
}

const houses = [];
(function genHouses() {
  let x = -180;
  while (x < BG_MAX_X) {
    const w = 110 + Math.random() * 80;
    const h = 95 + Math.random() * 125;
    const wins = [];
    const cols = Math.max(1, Math.floor(w / 46));
    const rows = Math.max(1, Math.floor(h / 52));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.68) {
          wins.push({
            dx: 18 + c * (w - 30) / cols,
            dy: 20 + r * (h - 30) / rows,
            ph: Math.random() * 6.28, warm: Math.random() < 0.85
          });
        }
      }
    }
    houses.push({
      x, w, h, wins, tri: Math.random() < 0.55,
      roofPick: Math.random() < 0.5 ? 0 : 1,
      hasChimney: Math.random() < 0.3
    });
    x += w + 14 + Math.random() * 50;
  }
})();

export function drawSky() {
  const scene = SCENES[state.scene];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  scene.skyStops.forEach(([p, c]) => g.addColorStop(p, c));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const hg = ctx.createLinearGradient(0, 300, 0, H);
  hg.addColorStop(0, 'rgba(0,0,0,0)');
  hg.addColorStop(1, scene.horizonGlow);
  ctx.fillStyle = hg; ctx.fillRect(0, 300, W, H - 300);
}

export function drawCelestial() {
  const scene = SCENES[state.scene];
  if (scene.celestial === 'moon') {
    const mx = 780 - (camera.x * 0.02) % (W * 3), my = 92;
    ctx.save();
    const g = ctx.createRadialGradient(mx, my, 8, mx, my, 150);
    g.addColorStop(0, 'rgba(255,244,206,0.36)');
    g.addColorStop(0.4, 'rgba(255,230,170,0.10)');
    g.addColorStop(1, 'rgba(255,230,170,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, 150, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff6d5'; ctx.beginPath(); ctx.arc(mx, my, 36, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(220,205,165,0.4)';
    ctx.beginPath(); ctx.arc(mx - 12, my - 8, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(mx + 14, my + 6, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(mx + 3, my - 18, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else if (scene.celestial === 'sun') {
    const sx = 780 - (camera.x * 0.02) % (W * 3), sy = 100;
    ctx.save();
    const g = ctx.createRadialGradient(sx, sy, 8, sx, sy, 180);
    g.addColorStop(0, 'rgba(255,240,180,0.75)');
    g.addColorStop(0.3, 'rgba(255,220,140,0.35)');
    g.addColorStop(1, 'rgba(255,220,140,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 180, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fffbe0'; ctx.beginPath(); ctx.arc(sx, sy, 44, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,180,0.35)'; ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const a = i * (Math.PI * 2 / 12) + camera.time * 0.15;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * 58, sy + Math.sin(a) * 58);
      ctx.lineTo(sx + Math.cos(a) * 80, sy + Math.sin(a) * 80);
      ctx.stroke();
    }
    ctx.restore();
  } else if (scene.celestial === 'sunset') {
    const sx = 780 - (camera.x * 0.02) % (W * 3), sy = 300;
    ctx.save();
    const g = ctx.createRadialGradient(sx, sy, 8, sx, sy, 220);
    g.addColorStop(0, 'rgba(255,220,140,0.85)');
    g.addColorStop(0.4, 'rgba(255,160,80,0.35)');
    g.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 220, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff0b8'; ctx.beginPath(); ctx.arc(sx, sy, 50, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

export function drawClouds() {
  const scene = SCENES[state.scene];
  for (const c of clouds) {
    const cx = c.x - (camera.x * 0.06 + camera.time * c.spd) % (W + 400);
    const drawX = cx < -200 ? cx + W + 400 : cx;
    ctx.save();
    ctx.globalAlpha = c.alpha;
    let colA, colB, colC;
    if (scene.cloudTint === 'white') { colA = '255,255,255'; colB = '240,245,255'; colC = '220,235,255'; }
    else if (scene.cloudTint === 'coral') { colA = '255,180,140'; colB = '240,140,110'; colC = '200,100,80'; }
    else { colA = '200,140,180'; colB = '140,90,140'; colC = '100,60,120'; }
    const g = ctx.createRadialGradient(drawX, c.y, 5, drawX, c.y, c.w * 0.6);
    g.addColorStop(0, `rgba(${colA},1)`);
    g.addColorStop(0.5, `rgba(${colB},0.6)`);
    g.addColorStop(1, `rgba(${colC},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(drawX, c.y, c.w * 0.6, c.h, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

export function drawStars() {
  const scene = SCENES[state.scene];
  if (!scene.hasStars) return;
  for (const s of stars) {
    const a = 0.2 + 0.8 * Math.abs(Math.sin(camera.time * s.s + s.p));
    ctx.globalAlpha = a;
    const col = s.hue === 'warm' ? '#ffe4b0' : '#e8eeff';
    if (s.r > 1.2) {
      const g = ctx.createRadialGradient(s.x - (camera.x * 0.02) % W, s.y, 0, s.x - (camera.x * 0.02) % W, s.y, s.r * 6);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(s.x - (camera.x * 0.02) % W, s.y, s.r * 6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(s.x - (camera.x * 0.02) % W, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawHouses() {
  const scene = SCENES[state.scene];
  const baseY = 418;
  ctx.save();
  ctx.translate(-camera.x * 0.35, 0);
  for (const h of houses) {
    const hy = baseY - h.h;
    const bg = ctx.createLinearGradient(0, hy, 0, baseY);
    bg.addColorStop(0, scene.houseA); bg.addColorStop(1, scene.houseB);
    ctx.fillStyle = bg; ctx.fillRect(h.x, hy, h.w, h.h);
    ctx.strokeStyle = scene.key === 'day' ? 'rgba(140,110,80,0.4)' : 'rgba(180,150,220,0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(h.x, hy + 0.5); ctx.lineTo(h.x + h.w, hy + 0.5); ctx.stroke();
    if (h.tri) {
      ctx.fillStyle = h.roofPick === 0 ? scene.roofA : scene.roofB;
      ctx.beginPath();
      ctx.moveTo(h.x - 9, hy); ctx.lineTo(h.x + h.w/2, hy - 46); ctx.lineTo(h.x + h.w + 9, hy);
      ctx.closePath(); ctx.fill();
    }
    if (h.hasChimney) {
      ctx.fillStyle = h.roofPick === 0 ? scene.roofA : scene.roofB;
      const chX = h.x + h.w * 0.25;
      ctx.fillRect(chX, hy - 34, 12, 30);
      for (let s = 0; s < 3; s++) {
        const t = (camera.time * 0.5 + s * 0.4) % 1;
        ctx.globalAlpha = (1 - t) * 0.35;
        ctx.fillStyle = scene.key === 'night' ? '#c0a8d0' : '#ffffff';
        ctx.beginPath();
        ctx.arc(chX + 6 + Math.sin(t * 6) * 6, hy - 40 - t * 32, 3 + t * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    for (const w of h.wins) {
      const a = scene.key === 'day' ? 1 : (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(camera.time * 1.6 + w.ph)));
      const col = w.warm ? scene.winWarm : scene.winCool;
      const gx = h.x + w.dx + 5, gy = hy + w.dy + 7;
      const gl = ctx.createRadialGradient(gx, gy, 1, gx, gy, 22);
      gl.addColorStop(0, `rgba(${col},${0.32 * a})`);
      gl.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = gl;
      ctx.beginPath(); ctx.arc(gx, gy, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${col},${0.55 + a * 0.4})`;
      ctx.fillRect(h.x + w.dx, hy + w.dy, 11, 15);
      ctx.fillStyle = `rgba(255,255,255,${0.35 * a})`;
      ctx.fillRect(h.x + w.dx + 2, hy + w.dy + 2, 7, 4);
    }
  }
  if (scene.key !== 'day') {
    for (let i = 0; i < houses.length - 1; i++) {
      const a = houses[i], b = houses[i + 1];
      const y1 = baseY - a.h - 14, y2 = baseY - b.h - 14;
      const x1 = a.x + a.w, x2 = b.x;
      ctx.strokeStyle = 'rgba(30,20,40,0.9)'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + 26, x2, y2);
      ctx.stroke();
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        const px = x1 + (x2 - x1) * t;
        const py = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * 16;
        const hue = ['#ff5b5b','#ffd24a','#5bff9d','#5bb8ff'][(i + k) % 4];
        const tw = 0.5 + 0.5 * Math.sin(camera.time * 3 + k + i);
        const bg2 = ctx.createRadialGradient(px, py, 0, px, py, 10);
        bg2.addColorStop(0, hue); bg2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = (0.35 + tw * 0.55) * 0.6;
        ctx.fillStyle = bg2;
        ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.55 + tw * 0.45;
        ctx.fillStyle = hue;
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}

export function drawDistantGround() {
  const scene = SCENES[state.scene];
  const g = ctx.createLinearGradient(0, 410, 0, GROUND_Y);
  scene.groundStops.forEach(([p, c]) => g.addColorStop(p, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 410, W, GROUND_Y - 410);
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.fillRect(0, 425, W, 2);
  ctx.fillRect(0, 438, W, 1.5);
}

export function drawRoad() {
  const scene = SCENES[state.scene];
  const g = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  scene.roadStops.forEach(([p, c]) => g.addColorStop(p, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  const rowH = 14;
  for (let row = 0; row < Math.ceil((H - GROUND_Y) / rowH); row++) {
    const yy = GROUND_Y + row * rowH;
    const offset = (row % 2) * 18;
    const shade = 0.05 + row * 0.015;
    ctx.fillStyle = `rgba(0,0,0,${shade})`;
    for (let x = -offset; x < W; x += 36) {
      ctx.beginPath();
      ctx.ellipse(x + 18, yy + 6, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = scene.key === 'day' ? 'rgba(255,240,200,0.22)' : 'rgba(255,200,140,0.12)';
  ctx.fillRect(0, GROUND_Y - 2, W, 2);
  ctx.fillStyle = '#4b3644';
  ctx.fillRect(0, GROUND_Y - 3, W, 1);

  const px = world.pandalCx - camera.x;
  const rg = ctx.createRadialGradient(px, GROUND_Y + 30, 20, px, GROUND_Y + 30, 500);
  rg.addColorStop(0, 'rgba(255,170,70,0.30)');
  rg.addColorStop(0.5, 'rgba(255,150,60,0.10)');
  rg.addColorStop(1, 'rgba(255,150,60,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(px - 500, GROUND_Y - 120, 1000, H - GROUND_Y + 120);
}