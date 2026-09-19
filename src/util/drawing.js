import { ctx } from '../core/canvas.js';

export function rrect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function screenToCanvas(clientX, clientY) {
  const cvs = ctx.canvas;
  const r = cvs.getBoundingClientRect();
  /* Map CSS pixel to the game's 960×540 logical space (not the internal
     device-pixel resolution) so hit tests still line up. */
  return {
    x: (clientX - r.left) / r.width  * 960,
    y: (clientY - r.top ) / r.height * 540
  };
}

export function drawOrnateLine(cx, y, width, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx - width/2, y); ctx.lineTo(cx - 22, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 22, y); ctx.lineTo(cx + width/2, y); ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, y - 5); ctx.lineTo(cx + 6, y); ctx.lineTo(cx, y + 5); ctx.lineTo(cx - 6, y);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(cx - width/2, y, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + width/2, y, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawCornerFlourish(x, y, sx, sy) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(sx, sy);
  ctx.strokeStyle = 'rgba(255,210,90,0.85)';
  ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 26); ctx.lineTo(0, 8);
  ctx.quadraticCurveTo(0, 0, 8, 0); ctx.lineTo(26, 0); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, 10); ctx.quadraticCurveTo(12, 10, 12, 16); ctx.stroke();
  ctx.fillStyle = 'rgba(255,210,90,0.95)';
  ctx.beginPath(); ctx.arc(4, 4, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawOmCartouche(cx, cy) {
  const r = 22;
  const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, r * 2.4);
  g.addColorStop(0, 'rgba(255,180,60,0.55)');
  g.addColorStop(1, 'rgba(255,180,60,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 2.4, 0, Math.PI * 2); ctx.fill();

  const bg = ctx.createRadialGradient(cx, cy - 5, 2, cx, cy, r);
  bg.addColorStop(0, 'rgba(105,42,22,1)');
  bg.addColorStop(1, 'rgba(42,12,8,1)');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = 'rgba(255,210,90,1)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,210,90,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, r - 3.5, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = '#ffd24a';
  ctx.font = 'bold 24px "Noto Sans Devanagari", Georgia, serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('ॐ', cx, cy + 1);

  ctx.fillStyle = 'rgba(255,210,90,0.95)';
  ctx.beginPath();
  ctx.moveTo(cx, cy - r - 10); ctx.lineTo(cx + 5, cy - r - 3);
  ctx.lineTo(cx, cy - r + 4); ctx.lineTo(cx - 5, cy - r - 3);
  ctx.closePath(); ctx.fill();
}

export function drawInstrSection(x, y, w, h, iconChar, title, accent, lines) {
  const bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, `rgba(${accent},0.055)`);
  bg.addColorStop(1, `rgba(${accent},0.012)`);
  ctx.fillStyle = bg; rrect(x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = `rgba(${accent},0.22)`; ctx.lineWidth = 1;
  rrect(x, y, w, h, 12); ctx.stroke();

  const ix = x + 28, iy = y + 26, ir = 16;
  const gl = ctx.createRadialGradient(ix, iy, 2, ix, iy, ir * 1.8);
  gl.addColorStop(0, `rgba(${accent},0.35)`);
  gl.addColorStop(1, `rgba(${accent},0)`);
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(ix, iy, ir * 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(${accent},0.22)`; ctx.beginPath(); ctx.arc(ix, iy, ir, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `rgba(${accent},0.9)`; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(ix, iy, ir, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff8e8'; ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(iconChar, ix, iy + 1);

  ctx.fillStyle = `rgb(${accent})`; ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(title, ix + ir + 12, iy);

  ctx.strokeStyle = `rgba(${accent},0.30)`; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 22, y + 54); ctx.lineTo(x + w - 22, y + 54); ctx.stroke();

  ctx.fillStyle = 'rgba(255,240,215,0.9)';
  ctx.font = '14px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], x + 22, y + 78 + i * 22);
}

export function drawCoinPill(x, y, coins) {
  const w = 130, h = 30;
  ctx.save();
  ctx.fillStyle = 'rgba(20,10,6,0.85)';
  rrect(x - w/2, y - h/2, w, h, 15); ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,74,0.7)'; ctx.lineWidth = 1.5;
  rrect(x - w/2, y - h/2, w, h, 15); ctx.stroke();

  const coinX = x - w/2 + 22, coinY = y;
  const cg = ctx.createRadialGradient(coinX - 2, coinY - 2, 1, coinX, coinY, 12);
  cg.addColorStop(0, '#fff2a8'); cg.addColorStop(0.6, '#ffd24a'); cg.addColorStop(1, '#c88a1a');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.arc(coinX, coinY, 10, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8a5c10'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(coinX, coinY, 10, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#8a5c10'; ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('₲', coinX, coinY + 1);

  ctx.fillStyle = '#ffd24a'; ctx.font = 'bold 17px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(String(coins), x - w/2 + 42, y + 1);
  ctx.restore();
}