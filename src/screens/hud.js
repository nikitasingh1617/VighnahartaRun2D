import { ctx, W, H } from '../core/canvas.js';
import { state, player, world, keys, camera } from '../core/state.js';
import { PLATE_X } from '../core/config.js';
import { DIFFICULTIES } from '../data/difficulties.js';
import { SCENES } from '../data/scenes.js';
import { LIGHT_INFO } from '../gameplay/lightCycle.js';
import { rrect } from '../util/drawing.js';
import { drawModak } from '../world/props.js';

function isAltHeld() {
  return !!keys['Alt'] || !!keys['alt'] || !!keys['AltGraph'];
}

export function drawHUD() {
  if (state.mode !== 'playing' && state.mode !== 'paused' && state.mode !== 'caught') return;

  const diff  = DIFFICULTIES[state.difficulty];
  const scene = SCENES[state.scene];
  if (!diff || !scene) return;

  ctx.save();
  ctx.textBaseline = 'middle';

  /* --- Top-left panel --- */
  const pw = 210, ph = 62;
  ctx.fillStyle = 'rgba(10,6,20,0.62)';
  rrect(20, 18, pw, ph, 10); ctx.fill();
  ctx.strokeStyle = `rgba(${diff.colorRGB},0.55)`;
  ctx.lineWidth = 1.5;
  rrect(20, 18, pw, ph, 10); ctx.stroke();

  ctx.fillStyle = `rgba(${diff.colorRGB},0.20)`;
  rrect(28, 26, 66, 22, 6); ctx.fill();
  ctx.strokeStyle = diff.color; ctx.lineWidth = 1;
  rrect(28, 26, 66, 22, 6); ctx.stroke();
  ctx.fillStyle = diff.color;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(diff.name, 61, 37);

  ctx.fillStyle = scene.color;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(scene.icon + ' R' + state.round + '/5', 104, 37);

    ctx.fillStyle = 'rgba(255,210,74,0.9)';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('DISTANCE', 28, 62);
  ctx.fillStyle = '#ffd24a';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText(Math.round((state.runDistance || 0) / 10) + 'm', 96, 62);

  ctx.fillStyle = 'rgba(255,220,120,0.95)';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText('🪙 ' + (state.runCoins || 0), 210, 62);

  /* --- Top-right: modak counter --- */
  const mw = 176;
  ctx.fillStyle = 'rgba(10,6,20,0.62)';
  rrect(W - 20 - mw, 18, mw, 40, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,74,0.4)';
  rrect(W - 20 - mw, 18, mw, 40, 10); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const mx = W - 20 - mw + 30 + i * 30;
    ctx.globalAlpha = i < state.delivered ? 1 : 0.22;
    drawModak(mx, 38, 0.9, 0);
  }
  ctx.globalAlpha = 1;

  /* --- Top-center: light panel --- */
  const lx = W / 2, ly = 62;
  const info = LIGHT_INFO[state.lightPhase] || LIGHT_INFO.green;

  ctx.fillStyle = 'rgba(10,6,20,0.72)';
  rrect(lx - 180, 12, 360, 100, 16); ctx.fill();
  ctx.strokeStyle = `rgba(${info.rgba},0.75)`;
  ctx.lineWidth = 2.5;
  rrect(lx - 180, 12, 360, 100, 16); ctx.stroke();

  /* Lamp glow, circle, highlight — all confined to a small left region */
  const cxp = lx - 130;
  const gg = ctx.createRadialGradient(cxp, ly, 3, cxp, ly, 68);
  gg.addColorStop(0, `rgba(${info.rgba},0.65)`);
  gg.addColorStop(1, `rgba(${info.rgba},0)`);
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.arc(cxp, ly, 68, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = info.c;
  ctx.beginPath(); ctx.arc(cxp, ly, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.arc(cxp - 5, ly - 6, 6, 0, Math.PI * 2); ctx.fill();

  /* Progress ring */
  const cfg = diff.rounds[state.round - 1] || diff.rounds[0];
  let prog = 0;
  if (state.lightPhase === 'green') prog = Math.min(1, state.lightT / cfg.green);
  else if (state.lightPhase === 'warn') prog = Math.min(1, state.lightT / cfg.warn);
  else prog = Math.min(1, state.lightT / cfg.red);

  ctx.strokeStyle = info.c;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cxp, ly, 30, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
  ctx.stroke();

  /* Text — placed to the right of the lamp, safely away from the glow */
  ctx.textAlign = 'left';
  ctx.fillStyle = info.c;
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText(info.label, lx - 80, ly - 14);

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText(info.sub, lx - 80, ly + 16);

  /* ALT key badge during red */
  if (state.lightPhase === 'red') {
    const pulse = 1 + Math.sin(camera.time * 14) * 0.09;
    const pressed = isAltHeld();
    ctx.save();
    ctx.translate(lx + 142, ly);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = pressed ? 'rgba(60,232,110,0.9)' : 'rgba(255,56,56,0.9)';
    rrect(-38, -21, 76, 42, 9); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    rrect(-38, -21, 76, 42, 9); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ALT', 0, 1);
    ctx.restore();
  }

  /* --- Bottom: journey bar --- */
  const bx = 100, by = H - 40, bw = W - 200, bh = 16;
  const denom = (world.placeX - PLATE_X) || 1;
  const dRaw = (player.x - PLATE_X) / denom;
  const dProg = Math.max(0, Math.min(1, isFinite(dRaw) ? dRaw : 0));

  ctx.fillStyle = 'rgba(10,6,20,0.62)';
  rrect(bx - 14, by - 22, bw + 28, bh + 40, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,74,0.35)';
  ctx.lineWidth = 1.5;
  rrect(bx - 14, by - 22, bw + 28, bh + 40, 12); ctx.stroke();

  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = player.holding ? 'rgba(255,255,255,0.45)' : '#ffd24a';
  ctx.fillText('◀ PLATE', bx, by - 10);
  ctx.textAlign = 'right';
  ctx.fillStyle = player.holding ? '#ffd24a' : 'rgba(255,255,255,0.45)';
  ctx.fillText('PANDAL ▶', bx + bw, by - 10);
  ctx.textAlign = 'center';
  ctx.fillStyle = player.holding ? '#ffb86b' : '#a8e6a0';
  ctx.fillText(player.holding ? 'CARRYING MODAK →' : '← RETURNING FOR NEXT MODAK', bx + bw / 2, by - 10);

  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  rrect(bx, by, bw, bh, 8); ctx.fill();
  const bg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  bg.addColorStop(0, '#3ce86e');
  bg.addColorStop(0.7, '#ffbe1a');
  bg.addColorStop(1, '#ff8c1a');
  ctx.fillStyle = bg;
  rrect(bx, by, bw * dProg, bh, 8); ctx.fill();

  const markerX = bx + bw * dProg;
  ctx.fillStyle = player.holding ? '#ffd24a' : '#ffffff';
  ctx.beginPath(); ctx.arc(markerX, by + bh / 2, 9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.65)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(markerX, by + bh / 2, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#f5c518';
  ctx.beginPath(); ctx.arc(markerX, by + bh / 2 - 1, 3, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}