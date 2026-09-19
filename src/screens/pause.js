import { ctx, W, H } from '../core/canvas.js';
import { state } from '../core/state.js';
import { DIFFICULTIES } from '../data/difficulties.js';
import { SCENES } from '../data/scenes.js';
import { drawOrnateLine, rrect } from '../util/drawing.js';
import { drawButtons } from '../ui/buttons.js';

export function drawPauseOverlay() {
  ctx.fillStyle = 'rgba(4,2,12,0.72)';
  ctx.fillRect(0, 0, W, H);
  const cx = W / 2;
  const diff = DIFFICULTIES[state.difficulty];
  const scene = SCENES[state.scene];

  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const halo = ctx.createRadialGradient(cx, 150, 20, cx, 150, 320);
  halo.addColorStop(0, 'rgba(255,170,60,0.24)');
  halo.addColorStop(1, 'rgba(255,170,60,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(cx, 150, 320, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = '#ff9d2e'; ctx.shadowBlur = 32;
  ctx.fillStyle = '#ffd24a';
  ctx.font = 'bold 62px Georgia, serif';
  ctx.fillText('PAUSED', cx, 150);
  ctx.restore();

  drawOrnateLine(cx, 200, 340, 'rgba(255,210,74,0.55)');

  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffb86b';
  ctx.font = 'italic 18px Georgia, serif';
  ctx.fillText('Take a breath. Bappa is patient.', cx, 226);
  ctx.restore();

  const ibW = 440, ibH = 46, ibX = cx - ibW/2, ibY = 240;
  ctx.fillStyle = 'rgba(20,10,26,0.85)';
  rrect(ibX, ibY, ibW, ibH, 10); ctx.fill();
  ctx.strokeStyle = `rgba(${diff.colorRGB},0.6)`; ctx.lineWidth = 1.5;
  rrect(ibX, ibY, ibW, ibH, 10); ctx.stroke();
  ctx.save();
  ctx.fillStyle = diff.color;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(
    scene.icon + ' ' + scene.name + '   ·   ' + diff.icon + ' ' + diff.name +
    '   ·   R' + state.round + '/5   ·   SCORE ' + state.score,
    cx, ibY + ibH/2
  );
  ctx.restore();

  drawButtons();

  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#ffe9b0';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('ESC / P  ·  RESUME', cx, H - 16);
  ctx.restore();
}