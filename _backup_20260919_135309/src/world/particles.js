import { ctx } from '../core/canvas.js';
import { state, camera } from '../core/state.js';
import { SCENES } from '../data/scenes.js';
import { GROUND_Y } from '../core/config.js';

export const particles = [];
export const ambient = [];

export function spawnSparkles(x, y, n, col) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x, y, vx: (Math.random() - 0.5) * 280, vy: -Math.random() * 260 - 40,
      life: 0.6 + Math.random() * 0.7, max: 1.3,
      col: col || '#ffd24a', r: 2 + Math.random() * 3
    });
  }
}

export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (p.petal) {
      p.x += p.vx * dt + Math.sin(camera.time * 2 + p.y * 0.02) * 22 * dt;
      p.y += p.vy * dt;
      p.rot = (p.rot || 0) + (p.rotSpeed || 0) * dt;
      p.life -= dt;
      if (p.life <= 0 || p.y > 700) particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 620 * dt; p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

export function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    if (p.petal) {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0);
      ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.ellipse(0, 0, p.r * 1.6, p.r, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath(); ctx.ellipse(-p.r * 0.4, -p.r * 0.3, p.r * 0.7, p.r * 0.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      continue;
    }
    ctx.fillStyle = p.col;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function initAmbient() {
  const scene = SCENES[state.scene];
  ambient.length = 0;
  for (let i = 0; i < scene.ambientCount; i++) {
    const col = scene.ambientColors[Math.floor(Math.random() * scene.ambientColors.length)];
    ambient.push({
      x: Math.random() * 1000, // will be spread
      y: GROUND_Y - 40 - Math.random() * 260,
      r: 0.7 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.0,
      drift: 6 + Math.random() * 16,
      col, type: scene.ambient
    });
  }
  // spread across world
  for (const a of ambient) a.x = Math.random() * 8000;
}

export function updateAmbient(dt) {
  for (const f of ambient) {
    f.phase += dt * f.speed;
    if (f.type === 'embers') {
      f.y -= 18 * dt;
      f.x += Math.sin(f.phase * 0.7) * f.drift * dt;
      if (f.y < GROUND_Y - 260) f.y = GROUND_Y - 40;
    } else {
      f.x += Math.sin(f.phase * 0.7) * f.drift * dt;
      f.y += Math.cos(f.phase) * 6 * dt;
    }
  }
}

export function drawAmbient() {
  for (const f of ambient) {
    const a = 0.35 + 0.65 * Math.abs(Math.sin(f.phase));
    const col = f.col.join(',');
    if (f.type === 'butterflies') {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.globalAlpha = a;
      ctx.fillStyle = `rgb(${col})`;
      const fl = Math.abs(Math.sin(camera.time * 8 + f.phase));
      ctx.beginPath(); ctx.ellipse(-4 * fl, -1, 4 * fl + 1, 4, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse( 4 * fl, -1, 4 * fl + 1, 4,  0.3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      continue;
    }
    if (f.type === 'embers') {
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 10);
      g.addColorStop(0, `rgba(${col},${a})`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,240,200,${a * 0.9})`;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 0.7, 0, Math.PI * 2); ctx.fill();
      continue;
    }
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 12);
    g.addColorStop(0, `rgba(${col},${a})`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,255,240,${a * 0.9})`;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
  }
}