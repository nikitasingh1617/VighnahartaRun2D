import { ctx } from '../core/canvas.js';
import { state, player, camera, world } from '../core/state.js';
import { GROUND_Y, PLATE_X } from '../core/config.js';
import { playCoin } from '../core/audio.js';
import { particles } from './particles.js';
import { save, persistSave } from '../core/save.js';

export const coins = [];

export function spawnCoinsForRound(round) {
  coins.length = 0;
  const startX = PLATE_X + 320;
  const endX = world.placeX - 320;
  const span = endX - startX;
  const count = 4 + round; // 5 → 9 coins per round

  /* Height tiers — all reachable with the current jump arc */
  const heights = [
    GROUND_Y - 50,   // walk-through
    GROUND_Y - 50,
    GROUND_Y - 95,   // small hop
    GROUND_Y - 130,  // mid jump
    GROUND_Y - 155   // full jump apex
  ];

  for (let i = 0; i < count; i++) {
    const cx = startX + (span / count) * i + (span / count) * 0.5;
    const y = heights[Math.floor(Math.random() * heights.length)];
    coins.push({
      x: cx,
      y: y,
      baseY: y,
      phase: Math.random() * Math.PI * 2,
      collected: false,
      value: 10
    });
  }
}

export function updateCoins(dt) {
  for (const c of coins) {
    if (c.collected) continue;
    c.phase += dt * 2.5;
    c.y = c.baseY + Math.sin(c.phase) * 4;

    /* AABB overlap with the player (slightly generous) */
    const h = player.crouching ? 40 : 78;
    const w = player.crouching ? 32 : 28;
    const pb = { x: player.x - w / 2 - 4, y: player.y - h - 4, w: w + 8, h: h + 8 };
    const cb = { x: c.x - 16, y: c.y - 16, w: 32, h: 32 };

    if (pb.x < cb.x + cb.w && pb.x + pb.w > cb.x &&
        pb.y < cb.y + cb.h && pb.y + pb.h > cb.y) {
      collectCoin(c);
    }
  }
}

function collectCoin(c) {
  c.collected = true;
  state.runCoins += c.value;
  save.coins += c.value;
  persistSave();
  playCoin();

  /* Burst of golden sparks */
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 100 + Math.random() * 180;
    particles.push({
      x: c.x, y: c.y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd - 80,
      life: 0.6 + Math.random() * 0.5, max: 1.1,
      col: '#ffd24a', r: 2 + Math.random() * 2.5
    });
  }
}

export function drawCoins() {
  for (const c of coins) {
    if (c.collected) continue;
    drawCoinSprite(c);
  }
}

function drawCoinSprite(c) {
  const bob = Math.sin(c.phase * 1.5) * 2;
  const spinX = Math.cos(c.phase * 1.8);

  /* Glow */
  const g = ctx.createRadialGradient(c.x, c.y + bob, 2, c.x, c.y + bob, 32);
  g.addColorStop(0, 'rgba(255,220,120,0.65)');
  g.addColorStop(0.5, 'rgba(255,200,80,0.25)');
  g.addColorStop(1, 'rgba(255,200,80,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(c.x, c.y + bob, 32, 0, Math.PI * 2); ctx.fill();

  /* Body with spin (ellipse squeezes on x-axis) */
  const rx = Math.abs(spinX) * 13 + 2;
  const ry = 15;

  const cg = ctx.createRadialGradient(c.x - 3, c.y + bob - 3, 1, c.x, c.y + bob, ry);
  cg.addColorStop(0, '#fff2a8');
  cg.addColorStop(0.5, '#ffd24a');
  cg.addColorStop(1, '#c88a1a');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y + bob, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#8a5c10';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y + bob, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  /* Symbol, faded when the coin is edge-on */
  if (rx > 6) {
    const alpha = Math.min(1, (rx - 6) / 5);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#8a5c10';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('₲', c.x, c.y + bob + 1);
    ctx.globalAlpha = 1;
  }

  /* Highlight */
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(c.x - rx * 0.4, c.y + bob - ry * 0.4, rx * 0.35, ry * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
}