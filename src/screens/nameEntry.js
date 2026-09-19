import { ctx, W } from '../core/canvas.js';
import { camera } from '../core/state.js';
import { drawMenuBackground } from './_background.js';
import {
  drawOrnateLine, drawCornerFlourish, drawOmCartouche, rrect
} from '../util/drawing.js';
import { save } from '../core/save.js';
import { drawButtons } from '../ui/buttons.js';
import { drawKeyboard } from '../ui/virtualKeyboard.js';

export function drawNameEntryScreen() {
  drawMenuBackground();

  /* Header */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const halo = ctx.createRadialGradient(W / 2, 60, 20, W / 2, 60, 300);
  halo.addColorStop(0, 'rgba(255,170,60,0.28)');
  halo.addColorStop(1, 'rgba(255,170,60,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(W / 2, 60, 300, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = 'rgba(255,210,120,0.82)';
  ctx.font = 'bold 10px Georgia, serif';
  ctx.fillText('✦    O N E   L A S T   T H I N G    ✦', W / 2, 24);

  const tg = ctx.createLinearGradient(0, 40, 0, 82);
  tg.addColorStop(0, '#fff6d0');
  tg.addColorStop(0.5, '#ffd24a');
  tg.addColorStop(1, '#e8a020');
  ctx.fillStyle = tg;
  ctx.shadowColor = 'rgba(255,150,40,0.55)';
  ctx.shadowBlur = 18;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('NAME YOUR BHAKT', W / 2, 60);
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255,220,150,0.78)';
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillText('This name will appear on the leaderboard', W / 2, 88);
  ctx.restore();

  drawOrnateLine(W / 2, 104, 320, 'rgba(255,210,74,0.4)');

  /* Name display box */
  const name = save.playerName || '';
  const boxW = 500, boxH = 68;
  const boxX = W / 2 - boxW / 2, boxY = 118;

  ctx.save();
  ctx.shadowColor = 'rgba(255,200,90,0.35)';
  ctx.shadowBlur = 24;
  const inBg = ctx.createLinearGradient(0, boxY, 0, boxY + boxH);
  inBg.addColorStop(0, 'rgba(30,14,20,0.96)');
  inBg.addColorStop(1, 'rgba(14,6,12,0.98)');
  ctx.fillStyle = inBg;
  rrect(boxX, boxY, boxW, boxH, 14);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,210,74,0.75)';
  ctx.lineWidth = 2.2;
  rrect(boxX, boxY, boxW, boxH, 14);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,210,74,0.25)';
  ctx.lineWidth = 1;
  rrect(boxX + 5, boxY + 5, boxW - 10, boxH - 10, 10);
  ctx.stroke();

  drawCornerFlourish(boxX + 12, boxY + 12, 1, 1);
  drawCornerFlourish(boxX + boxW - 12, boxY + 12, -1, 1);
  drawCornerFlourish(boxX + 12, boxY + boxH - 12, 1, -1);
  drawCornerFlourish(boxX + boxW - 12, boxY + boxH - 12, -1, -1);

  /* Name text */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (name.length > 0) {
    ctx.fillStyle = '#ffd24a';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText(name, W / 2, boxY + boxH / 2);
  } else {
    ctx.fillStyle = 'rgba(255,210,74,0.4)';
    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillText('tap the letters below…', W / 2, boxY + boxH / 2);
  }

  const blink = Math.sin(camera.time * 6) > 0;
  if (blink && name.length < 14) {
    const textW = name.length > 0 ? ctx.measureText(name).width : 0;
    const cursorX = W / 2 + textW / 2 + 6;
    ctx.strokeStyle = '#ffd24a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cursorX, boxY + boxH / 2 - 16);
    ctx.lineTo(cursorX, boxY + boxH / 2 + 16);
    ctx.stroke();
  }
  ctx.restore();

  /* Virtual keyboard */
  drawKeyboard();

  /* Hint */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,235,200,0.5)';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('Up to 14 letters  ·  ⌫ to delete', W / 2, 388);
  ctx.restore();

  drawButtons();
}