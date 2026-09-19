import { ctx, W, H } from '../core/canvas.js';
import { camera } from '../core/state.js';
import { drawMenuBackground } from './_background.js';
import { drawOrnateLine, drawCoinPill, rrect } from '../util/drawing.js';
import { save } from '../core/save.js';
import { drawButtons } from '../ui/buttons.js';

export function drawMenuScreen() {
  drawMenuBackground();
  drawTitle();
  drawOrnateLine(W/2, 232, 460, 'rgba(255,210,74,0.55)');

  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 14;
  ctx.fillStyle = '#ffb86b'; ctx.font = 'italic 20px Georgia, serif';
  ctx.fillText('॥ Ganpati Bappa Morya ॥', W/2, 262);
  ctx.restore();

  /* Coin pill in top-right corner */
  drawCoinPill(W - 90, 40, save.coins);

  /* Player name pill in top-left */
  if (save.playerName) {
  const pw = 190, ph = 30, px = 20, py = 25;
  ctx.save();
  ctx.fillStyle = 'rgba(20,10,6,0.85)';
  rrect(px, py, pw, ph, 15); ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,74,0.6)'; ctx.lineWidth = 1.5;
  rrect(px, py, pw, ph, 15); ctx.stroke();
  ctx.fillStyle = 'rgba(255,210,120,0.85)';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('BHAKT', px + 14, py + ph / 2 + 1);
  ctx.fillStyle = '#ffd24a';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.fillText(save.playerName, px + 66, py + ph / 2 + 1);
  ctx.restore();
}

  drawButtons();

  const pulse = 0.5 + 0.5 * Math.sin(camera.time * 3);
  ctx.save();
  ctx.globalAlpha = 0.35 + pulse * 0.45;
  ctx.fillStyle = '#ffe9b0';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('SPACE  ·  PLAY          ESC  ·  EXIT', W/2, H - 16);
  ctx.restore();
}

function drawTitle() {
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const halo = ctx.createRadialGradient(W/2, 145, 20, W/2, 145, 360);
  halo.addColorStop(0, 'rgba(255,170,60,0.32)');
  halo.addColorStop(1, 'rgba(255,170,60,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(W/2, 145, 360, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = '#ff7a1a'; ctx.shadowBlur = 42;
  const tg = ctx.createLinearGradient(0, 70, 0, 200);
  tg.addColorStop(0, '#fff8d0'); tg.addColorStop(0.45, '#ffd24a'); tg.addColorStop(1, '#ff9d2e');
  ctx.fillStyle = tg;
  ctx.font = 'bold 68px Georgia, serif';
  ctx.fillText('VIGHNAHARTA', W/2, 112);
  ctx.shadowBlur = 54;
  ctx.font = 'bold 84px Georgia, serif';
  ctx.fillText('RUN', W/2, 190);
  ctx.restore();
}