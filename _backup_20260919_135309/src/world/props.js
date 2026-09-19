import { ctx } from '../core/canvas.js';
import { camera, state, player } from '../core/state.js';
import { GROUND_Y, PLATE_X, INTERACT_RANGE } from '../core/config.js';
import { world } from '../core/state.js';
import { rrect } from '../util/drawing.js';

export function drawModak(x, y, s, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s);
  const g = ctx.createLinearGradient(0, -11, 0, 9);
  g.addColorStop(0, '#fffdf6'); g.addColorStop(1, '#ecd8ae');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.bezierCurveTo(9.5, -8, 9.5, 6, 0, 9.5);
  ctx.bezierCurveTo(-9.5, 6, -9.5, -8, 0, -11);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(206,176,116,0.75)'; ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(0, -10.5);
    ctx.quadraticCurveTo(i * 3.2, -2, i * 4.4, 7.5);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.arc(-3, -6, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawDiya(x, y, s) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  const f = 0.85 + Math.sin(camera.time * 11 + x * 0.3) * 0.15;
  const g = ctx.createRadialGradient(0, -9, 1, 0, -9, 34);
  g.addColorStop(0, 'rgba(255,196,86,0.75)');
  g.addColorStop(0.5, 'rgba(255,170,60,0.25)');
  g.addColorStop(1, 'rgba(255,150,40,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -9, 34, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a85a1c';
  ctx.beginPath();
  ctx.moveTo(-11, 0); ctx.quadraticCurveTo(0, 15, 11, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd24a';
  ctx.beginPath(); ctx.ellipse(0, -7 * f, 4, 8.5 * f, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff8cc';
  ctx.beginPath(); ctx.ellipse(0, -6 * f, 1.8, 4 * f, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawStartTable() {
  const tx = 78, ty = GROUND_Y;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(tx + 56, ty + 3, 60, 6, 0, 0, Math.PI * 2); ctx.fill();
  const tg = ctx.createLinearGradient(0, ty - 60, 0, ty - 48);
  tg.addColorStop(0, '#7a4324'); tg.addColorStop(1, '#3d2010');
  ctx.fillStyle = tg; ctx.fillRect(tx, ty - 58, 112, 10);
  ctx.fillStyle = '#3d2010';
  ctx.fillRect(tx + 12, ty - 48, 9, 48);
  ctx.fillRect(tx + 91, ty - 48, 9, 48);
  ctx.fillStyle = '#c62828'; ctx.fillRect(tx - 2, ty - 62, 116, 6);
  ctx.fillStyle = '#ffd24a'; ctx.fillRect(tx - 2, ty - 62, 116, 1.5);
  ctx.fillStyle = '#ded3bd';
  ctx.beginPath(); ctx.ellipse(tx + 56, ty - 65, 40, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c9bda3';
  ctx.beginPath(); ctx.ellipse(tx + 56, ty - 66, 31, 7.5, 0, 0, Math.PI * 2); ctx.fill();
  const remaining = Math.max(0, 5 - state.delivered - (player.holding ? 1 : 0));
  const spots = [[-19,1],[-7,-3],[7,1],[19,-2],[0,4]];
  for (let i = 0; i < remaining; i++) {
    const p = spots[i] || [0,0];
    drawModak(tx + 56 + p[0], ty - 72 + p[1], 0.95, 0);
  }
  drawDiya(tx + 130, ty - 2, 0.9);
}

export function drawInteractPrompt() {
  if (state.mode !== 'playing' || !player.onGround) return;
  let targetX = null, label = null;
  if (player.holding) {
    if (Math.abs(player.x - world.placeX) < INTERACT_RANGE) { targetX = world.placeX; label = 'OFFER MODAK'; }
  } else if (state.delivered < 5 && Math.abs(player.x - PLATE_X) < INTERACT_RANGE) {
    targetX = PLATE_X; label = 'PICK UP MODAK';
  }
  if (targetX === null) return;
  const py = GROUND_Y - 128 + Math.sin(camera.time * 3) * 4;
  const pulse = 1 + Math.sin(camera.time * 6) * 0.05;
  ctx.save();
  ctx.translate(targetX, py); ctx.scale(pulse, pulse);
  const g = ctx.createRadialGradient(0, 0, 6, 0, 0, 78);
  g.addColorStop(0, 'rgba(255,210,74,0.42)');
  g.addColorStop(1, 'rgba(255,210,74,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 78, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(18,8,26,0.92)';
  rrect(-100, -21, 200, 42, 21); ctx.fill();
  ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 2;
  rrect(-100, -21, 200, 42, 21); ctx.stroke();
  ctx.fillStyle = '#ffd24a'; rrect(-90, -15, 30, 30, 7); ctx.fill();
  ctx.fillStyle = '#1a0d05';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('E', -75, 0);
  ctx.fillStyle = '#ffd24a';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, -50, 0);
  ctx.restore();
}