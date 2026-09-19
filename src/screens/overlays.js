import { ctx, W, H } from '../core/canvas.js';
import { state, camera } from '../core/state.js';
import { SCENES } from '../data/scenes.js';
import { rrect } from '../util/drawing.js';
import { drawButtons } from '../ui/buttons.js';


export function drawOverlay() {
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255,200,120,${state.flash * 0.35})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (state.fade > 0.001) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(1, state.fade)})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (state.mode === 'paused') return;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  /* --- Round-start celebration banner --- */
  if (state.celebration && state.mode === 'playing') {
    const t = state.celebration.timer / state.celebration.max;
    const rise = (1 - t) * 45;
    ctx.globalAlpha = Math.min(1, t * 1.6);
    ctx.save();
    ctx.shadowColor = '#ffb02e'; ctx.shadowBlur = 26;
    ctx.fillStyle = '#ffd24a';
    ctx.font = 'bold 46px system-ui, sans-serif';
    ctx.fillText(state.celebration.text, W / 2, 200 - rise);
    ctx.restore();
    if (state.celebration.sub) {
      ctx.fillStyle = '#ffe9b0';
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillText(state.celebration.sub, W / 2, 240 - rise);
    }
    ctx.globalAlpha = 1;
  }

  /* --- CAUGHT --- */
  if (state.mode === 'caught') {
    ctx.fillStyle = 'rgba(60,0,0,0.68)';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.shadowColor = '#ff2222'; ctx.shadowBlur = 30;
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 72px system-ui, sans-serif';
    ctx.fillText('CAUGHT!', W / 2, H / 2 - 70);
    ctx.restore();

    ctx.fillStyle = '#ffd0d0';
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillText('You broke the aarti pose.', W / 2, H / 2 - 6);

    ctx.fillStyle = '#ffb86b';
    ctx.font = '21px system-ui, sans-serif';
    ctx.fillText('All modaks lost — starting from Round 1...', W / 2, H / 2 + 36);

    ctx.fillStyle = 'rgba(255,235,200,0.55)';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(
      state.delivered >= 1
        ? 'Your run has been saved to the leaderboard.'
        : 'Complete at least one round to enter the leaderboard.',
      W / 2, H / 2 + 74
    );
  }

  /* --- WIN / POOJA --- */
  if (state.mode === 'win') {
    drawWinOverlay();
  }

  ctx.restore();

  if (state.mode === 'caught' || state.mode === 'win') {
    drawButtons();
  }
}

function drawWinOverlay() {
  const topG = ctx.createLinearGradient(0, 0, 0, 220);
  topG.addColorStop(0, 'rgba(20,6,0,0.85)');
  topG.addColorStop(1, 'rgba(20,6,0,0)');
  ctx.fillStyle = topG;
  ctx.fillRect(0, 0, W, 220);

  const botG = ctx.createLinearGradient(0, H - 200, 0, H);
  botG.addColorStop(0, 'rgba(20,6,0,0)');
  botG.addColorStop(1, 'rgba(20,6,0,0.9)');
  ctx.fillStyle = botG;
  ctx.fillRect(0, H - 200, W, 200);

  const wg = ctx.createRadialGradient(W / 2, 100, 20, W / 2, 100, 420);
  wg.addColorStop(0, 'rgba(255,180,60,0.28)');
  wg.addColorStop(1, 'rgba(255,180,60,0)');
  ctx.fillStyle = wg;
  ctx.fillRect(0, 0, W, 260);

  const intro = Math.min(1, state.winT / 1.2);
  ctx.save();
  ctx.globalAlpha = intro;
  ctx.shadowColor = '#ffae2e'; ctx.shadowBlur = 40;
  ctx.fillStyle = '#ffd24a';
  ctx.font = 'bold 48px Georgia, serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('॥ POOJA COMPLETE ॥', W / 2, 60);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = intro;
  ctx.fillStyle = '#ffb86b';
  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillText('Ganpati Bappa Morya', W / 2, 102);
  ctx.restore();

  if (state.winT >= 2.0) {
    const sa = Math.min(1, (state.winT - 2.0) / 0.6);
    ctx.globalAlpha = sa;

    const cw = 440, chh = 250;
    const cX = W / 2 - cw / 2, cY = 138;
    ctx.fillStyle = 'rgba(24,10,8,0.94)';
    rrect(cX, cY, cw, chh, 16); ctx.fill();
    ctx.strokeStyle = 'rgba(255,210,74,0.7)'; ctx.lineWidth = 2;
    rrect(cX, cY, cw, chh, 16); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,210,74,0.25)'; ctx.lineWidth = 1;
    rrect(cX + 5, cY + 5, cw - 10, chh - 10, 10); ctx.stroke();

    ctx.fillStyle = '#ffd24a';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCORE CARD', W / 2, cY + 24);

    ctx.strokeStyle = 'rgba(255,210,74,0.35)';
    ctx.beginPath();
    ctx.moveTo(cX + 24, cY + 38);
    ctx.lineTo(cX + cw - 24, cY + 38);
    ctx.stroke();

    const rowX1 = cX + 40;
    const rowX2 = cX + cw - 40;
    const row0 = cY + 70;
    const rowGap = 36;

    drawStatRow(rowX1, rowX2, row0,             'DISTANCE', Math.round((state.finalRunDistance || 0) / 10) + 'm', '#c8e6ff');
    drawStatRow(rowX1, rowX2, row0 + rowGap,    'TIME',     Math.round(state.finalRunTime || 0) + 's',           '#ffdcb4');
    drawStatRow(rowX1, rowX2, row0 + rowGap * 2,'ROUNDS',   '5 / 5',                                              '#a8e6a0');
    drawStatRow(rowX1, rowX2, row0 + rowGap * 3,'COINS',    '+' + (state.finalRunCoins || 0) + ' 🪙',             '#ffd24a');

    if (state.newBest) {
      const pulse = 0.6 + 0.4 * Math.sin(camera.time * 6);
      ctx.globalAlpha = sa * pulse;
      ctx.fillStyle = '#fff2b0';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ NEW BEST!', W / 2, cY + chh - 16);
      ctx.globalAlpha = sa;
    }
    if (state.newSceneUnlocked) {
      const ns = SCENES[state.newSceneUnlocked];
      const pulse = 0.6 + 0.4 * Math.sin(camera.time * 4);
      ctx.globalAlpha = sa * (0.75 + pulse * 0.25);
      ctx.fillStyle = ns.color;
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔓 ' + ns.name + ' UNLOCKED!', W / 2, cY + chh - 16);
      ctx.globalAlpha = sa;
    }

    ctx.globalAlpha = 1;
  }
}

function drawStatRow(labelX, valueX, y, label, value, valueColor) {
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,235,200,0.72)';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, labelX, y);

  ctx.textAlign = 'right';
  ctx.fillStyle = valueColor;
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(value, valueX, y);
}

export function drawCheatToast() {
  if (state.cheatToast <= 0) return;
  const a = Math.min(1, state.cheatToast / 0.35);
  const slide = (1 - Math.min(1, state.cheatToast / 0.6)) * 40;
  ctx.save();
  ctx.globalAlpha = a;
  const tw = 480, th = 48;
  const tx = W / 2 - tw / 2, ty = 130 + slide;
  ctx.fillStyle = 'rgba(12,4,16,0.94)';
  rrect(tx, ty, tw, th, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(120,255,180,0.75)'; ctx.lineWidth = 2;
  rrect(tx, ty, tw, th, 12); ctx.stroke();
  ctx.fillStyle = 'rgba(120,255,180,0.16)';
  rrect(tx + 4, ty + 4, 44, th - 8, 8); ctx.fill();
  ctx.fillStyle = '#7effc0';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('DEV', tx + 26, ty + th / 2 + 1);
  ctx.fillStyle = '#dfffe8';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(state.cheatMsg, tx + 60, ty + th / 2 + 1);
  ctx.restore();
}