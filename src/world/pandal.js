import { ctx } from '../core/canvas.js';
import { state, camera, world } from '../core/state.js';
import { GROUND_Y } from '../core/config.js';
import { rrect } from '../util/drawing.js';
import { drawModak, drawDiya } from './props.js';

export function drawPandal() {
  const cx = world.pandalCx;
  const L = cx - 232, R = cx + 232;
  const topY = GROUND_Y - 340;

  ctx.fillStyle = '#3d0a18';
  ctx.fillRect(L, topY + 54, R - L, GROUND_Y - topY - 54);
  for (let i = 0; i < 14; i++) {
    const x = L + i * (R - L) / 14;
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.13)';
    ctx.fillRect(x, topY + 54, (R - L) / 14, GROUND_Y - topY - 54);
  }
  const glowBoost = state.mode === 'win' ? Math.min(1, state.winT / 2) : 0;
  const gg = ctx.createRadialGradient(cx, GROUND_Y - 180, 20, cx, GROUND_Y - 180, 320);
  gg.addColorStop(0, `rgba(255,214,130,${0.40 + glowBoost * 0.35})`);
  gg.addColorStop(0.5, `rgba(255,170,80,${0.14 + glowBoost * 0.18})`);
  gg.addColorStop(1, 'rgba(255,150,60,0)');
  ctx.fillStyle = gg;
  ctx.fillRect(L - 60, topY - 60, R - L + 120, GROUND_Y - topY + 60);

  drawPillar(L + 46, topY + 46, GROUND_Y);
  drawPillar(R - 46, topY + 46, GROUND_Y);

  ctx.fillStyle = '#7a1226';
  ctx.beginPath();
  ctx.moveTo(L + 20, topY + 62);
  ctx.quadraticCurveTo(cx, topY - 10, R - 20, topY + 62);
  ctx.lineTo(R - 20, topY + 92);
  ctx.quadraticCurveTo(cx, topY + 20, L + 20, topY + 92);
  ctx.closePath(); ctx.fill();

  for (let i = 0; i <= 46; i++) {
    const t = i / 46;
    const px = L + 20 + (R - 40) * t;
    const py = topY + 62 + Math.sin(t * Math.PI) * -72 + 16;
    ctx.fillStyle = i % 2 === 0 ? '#ff8c1a' : '#ffb84d';
    ctx.beginPath(); ctx.arc(px, py, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,245,190,0.85)';
    ctx.beginPath(); ctx.arc(px, py - 2, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i <= 22; i++) {
    const t = i / 22;
    const px = L + 10 + (R - L - 20) * t;
    const py = topY + 52 + Math.sin(t * Math.PI) * -84;
    const hue = ['#ff5b5b','#ffd24a','#5bff9d','#5bb8ff','#ff8cff'][i % 5];
    const tw = 0.5 + 0.5 * Math.sin(camera.time * 4 + i);
    ctx.globalAlpha = 0.5 + tw * 0.5;
    ctx.fillStyle = hue;
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.18;
    ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  for (const side of [-1, 1]) {
    const px = cx + side * 186;
    for (let i = 0; i < 5; i++) {
      const a = -0.9 + i * 0.34;
      ctx.save();
      ctx.translate(px, GROUND_Y - 40 - i * 6);
      ctx.rotate(side * a);
      ctx.fillStyle = '#1f6b3a';
      ctx.beginPath(); ctx.ellipse(0, -34, 13, 40, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(60,160,90,0.55)';
      ctx.beginPath(); ctx.ellipse(0, -34, 6, 34, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
  ctx.fillStyle = '#7a1226';
  ctx.fillRect(L, GROUND_Y - 10, R - L, 10);
  ctx.fillStyle = '#ffd24a';
  ctx.fillRect(L, GROUND_Y - 12, R - L, 3);

  drawGanesha(cx, GROUND_Y - 10);

  for (let i = 0; i < 7; i++) {
    drawDiya(L + 60 + i * 62, GROUND_Y - 14, 0.85 + glowBoost * 0.35);
  }
  const px = world.placeX;
  ctx.fillStyle = '#5a3018';
  rrect(px - 34, GROUND_Y - 20, 68, 20, 4); ctx.fill();
  ctx.fillStyle = '#ded3bd';
  ctx.beginPath(); ctx.ellipse(px, GROUND_Y - 22, 34, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c9bda3';
  ctx.beginPath(); ctx.ellipse(px, GROUND_Y - 23, 26, 7, 0, 0, Math.PI * 2); ctx.fill();
  const spots = [[-16,0],[-5,-2],[5,0],[16,-2],[0,2]];
  for (let i = 0; i < state.delivered; i++) {
    const s = spots[i] || [0, 0];
    drawModak(px + s[0], GROUND_Y - 28 + s[1], 0.95, 0);
  }
  const og = ctx.createRadialGradient(px, GROUND_Y - 30, 4, px, GROUND_Y - 30, 90);
  og.addColorStop(0, `rgba(255,220,140,${0.28 + glowBoost * 0.3})`);
  og.addColorStop(1, 'rgba(255,200,100,0)');
  ctx.fillStyle = og;
  ctx.beginPath(); ctx.arc(px, GROUND_Y - 30, 90, 0, Math.PI * 2); ctx.fill();
}

export function drawPillar(x, y0, y1) {
  const w = 26;
  const g = ctx.createLinearGradient(x - w/2, 0, x + w/2, 0);
  g.addColorStop(0, '#5c0e1e'); g.addColorStop(0.4, '#8e1c2e'); g.addColorStop(1, '#4a0a18');
  ctx.fillStyle = g;
  ctx.fillRect(x - w/2, y0, w, y1 - y0);
  ctx.fillStyle = '#ffd24a';
  for (let yy = y0 + 24; yy < y1 - 20; yy += 62) {
    ctx.fillRect(x - w/2 - 4, yy, w + 8, 6);
  }
  ctx.fillStyle = '#ffd24a';
  ctx.fillRect(x - w/2 - 8, y0 - 8, w + 16, 12);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#ff8c1a' : '#ffb84d';
    ctx.beginPath(); ctx.arc(x, y0 + 24 + i * 22, 5, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawGanesha(cx, baseY) {
  ctx.fillStyle = '#8e1c2e';
  rrect(cx - 112, baseY - 46, 224, 46, 7); ctx.fill();
  ctx.fillStyle = '#ffd24a';
  ctx.fillRect(cx - 116, baseY - 50, 232, 6);
  ctx.fillRect(cx - 116, baseY - 6, 232, 6);
  ctx.fillStyle = 'rgba(255,210,74,0.35)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.arc(cx - 80 + i * 40, baseY - 24, 8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#ff9db0';
  ctx.beginPath(); ctx.ellipse(cx, baseY - 50, 80, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffc3cf';
  ctx.beginPath(); ctx.ellipse(cx, baseY - 54, 62, 11, 0, 0, Math.PI * 2); ctx.fill();
  const by = baseY - 54;
  const hg = ctx.createRadialGradient(cx, by - 150, 10, cx, by - 150, 145);
  hg.addColorStop(0, 'rgba(255,232,150,0.50)');
  hg.addColorStop(0.55, 'rgba(255,200,90,0.16)');
  hg.addColorStop(1, 'rgba(255,180,60,0)');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.arc(cx, by - 150, 145, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8474c';
  ctx.beginPath();
  ctx.moveTo(cx - 60, by - 4);
  ctx.quadraticCurveTo(cx - 74, by - 70, cx - 42, by - 98);
  ctx.lineTo(cx + 42, by - 98);
  ctx.quadraticCurveTo(cx + 74, by - 70, cx + 60, by - 4);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,74,0.6)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - 22, by - 40); ctx.quadraticCurveTo(cx - 34, by - 16, cx - 30, by - 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 22, by - 40); ctx.quadraticCurveTo(cx + 34, by - 16, cx + 30, by - 6); ctx.stroke();
  ctx.fillStyle = '#f2a95c';
  ctx.beginPath();
  ctx.moveTo(cx - 42, by - 92);
  ctx.quadraticCurveTo(cx - 50, by - 142, cx - 32, by - 158);
  ctx.lineTo(cx + 32, by - 158);
  ctx.quadraticCurveTo(cx + 50, by - 142, cx + 42, by - 92);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, by - 108, 33, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#f2a95c'; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 38, by - 142);
  ctx.quadraticCurveTo(cx - 86, by - 112, cx - 66, by - 62); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 38, by - 142);
  ctx.quadraticCurveTo(cx + 92, by - 152, cx + 88, by - 200); ctx.stroke();
  ctx.fillStyle = '#f2a95c';
  ctx.beginPath(); ctx.arc(cx + 88, by - 208, 12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx - 66, by - 58, 11, 0, Math.PI * 2); ctx.fill();
  drawModak(cx - 66, by - 72, 1.05, -0.2);
  const hx = cx, hy = by - 190, hr = 43;
  ctx.fillStyle = '#e2944a';
  ctx.beginPath(); ctx.ellipse(hx - 54, hy + 6, 25, 37, -0.16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx + 54, hy + 6, 25, 37, 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#cf7c34';
  ctx.beginPath(); ctx.ellipse(hx - 54, hy + 6, 14, 24, -0.16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx + 54, hy + 6, 14, 24, 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2a95c';
  ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#f2a95c'; ctx.lineWidth = 19; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hx + 1, hy + 22);
  ctx.bezierCurveTo(hx + 24, hy + 58, hx - 12, hy + 84, hx + 6, hy + 112); ctx.stroke();
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(hx + 6, hy + 110);
  ctx.quadraticCurveTo(hx - 2, hy + 120, hx + 10, hy + 124); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(hx - 17, hy - 5, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx + 17, hy - 5, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a1f10';
  ctx.beginPath(); ctx.arc(hx - 15, hy - 5, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx + 19, hy - 5, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(hx - 16, hy - 7, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx + 18, hy - 7, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8a4a1c'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(hx - 17, hy - 13, 9, Math.PI * 1.15, Math.PI * 1.95); ctx.stroke();
  ctx.beginPath(); ctx.arc(hx + 17, hy - 13, 9, Math.PI * 1.05, Math.PI * 1.85); ctx.stroke();
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath();
  ctx.moveTo(hx - 27, hy + 22); ctx.lineTo(hx - 21, hy + 44); ctx.lineTo(hx - 13, hy + 22);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(hx + 16, hy + 22); ctx.lineTo(hx + 23, hy + 33); ctx.lineTo(hx + 28, hy + 22);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd24a';
  ctx.beginPath();
  ctx.moveTo(hx - 38, hy - 26);
  ctx.quadraticCurveTo(hx, hy - 33, hx + 38, hy - 26);
  ctx.lineTo(hx + 31, hy - 82);
  ctx.quadraticCurveTo(hx, hy - 104, hx - 31, hy - 82);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8474c';
  ctx.beginPath(); ctx.arc(hx, hy - 74, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff2b0';
  ctx.beginPath(); ctx.arc(hx - 2, hy - 76, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd24a';
  ctx.beginPath();
  ctx.moveTo(hx - 9, hy - 96); ctx.lineTo(hx, hy - 122); ctx.lineTo(hx + 9, hy - 96);
  ctx.closePath(); ctx.fill();
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    const gx = cx - 54 + t * 108;
    const gy = by - 146 + Math.sin(t * Math.PI) * 36;
    ctx.fillStyle = i % 2 === 0 ? '#ff8c1a' : '#ffb84d';
    ctx.beginPath(); ctx.arc(gx, gy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,180,0.7)';
    ctx.beginPath(); ctx.arc(gx, gy - 2, 2, 0, Math.PI * 2); ctx.fill();
  }
}