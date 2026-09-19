import { ctx, W, H } from '../core/canvas.js';
import { drawMenuBackground } from './_background.js';
import { drawOrnateLine, drawCoinPill } from '../util/drawing.js';
import { save } from '../core/save.js';
import { drawButtons } from '../ui/buttons.js';

export function drawShopScreen() {
  drawMenuBackground();
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const halo = ctx.createRadialGradient(W/2, 66, 20, W/2, 66, 320);
  halo.addColorStop(0, 'rgba(200,160,255,0.30)');
  halo.addColorStop(1, 'rgba(200,160,255,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(W/2, 66, 320, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c8a8ff';
  ctx.shadowColor = 'rgba(160,100,255,0.6)'; ctx.shadowBlur = 22;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('👕  OUTFIT SHOP', W/2, 58);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,220,255,0.72)';
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillText('Dress the boy in his finest for Bappa\u2019s darshan', W/2, 86);
  ctx.restore();
  drawCoinPill(W - 90, 40, save.coins);
  drawOrnateLine(W/2, 100, 400, 'rgba(255,210,74,0.4)');
  drawButtons();
}