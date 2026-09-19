import { ctx, W } from '../core/canvas.js';
import { drawMenuBackground } from './_background.js';
import { drawOrnateLine } from '../util/drawing.js';
import { drawButtons } from '../ui/buttons.js';

export function drawExitScreen() {
  drawMenuBackground();
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const halo = ctx.createRadialGradient(W/2, 180, 20, W/2, 180, 320);
  halo.addColorStop(0, 'rgba(255,170,60,0.24)');
  halo.addColorStop(1, 'rgba(255,170,60,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(W/2, 180, 320, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = '#ff9d2e'; ctx.shadowBlur = 32;
  ctx.fillStyle = '#ffd24a';
  ctx.font = 'bold 54px Georgia, serif';
  ctx.fillText('THANK YOU FOR PLAYING', W/2, 150);
  ctx.restore();
  drawOrnateLine(W/2, 196, 380, 'rgba(255,210,74,0.5)');
  ctx.fillStyle = '#ffb86b';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('॥ Ganpati Bappa Morya ॥', W/2, 226);
  ctx.fillStyle = 'rgba(255,240,210,0.9)';
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText('May Bappa remove every obstacle from your path.', W/2, 278);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('You may close this tab now.', W/2, 314);
  drawButtons();
}