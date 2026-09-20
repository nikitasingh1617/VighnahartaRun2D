import { ctx, W } from '../core/canvas.js';
import { drawMenuBackground } from './_background.js';
import { drawOrnateLine, drawCoinPill, rrect } from '../util/drawing.js';
import { save } from '../core/save.js';
import { SCENES } from '../data/scenes.js';
import { DIFFICULTIES } from '../data/difficulties.js';
import { drawButtons } from '../ui/buttons.js';
import { fetchLeaderboard, mergeLeaderboards, getCachedBoard } from '../cloud.js';

let cachedBoard = null;
let loading = false;
let lastFetch = 0;
let lastError = false;

function populateFromCache() {
  const cloudCache = getCachedBoard();
  cachedBoard = mergeLeaderboards(save.leaderboard, cloudCache || []);
}

export function refreshLeaderboard(force = false) {
  if (loading) return;
  if (!force && Date.now() - lastFetch < 3000 && cachedBoard) return;

  loading = true;
  lastError = false;

  fetchLeaderboard().then(cloud => {
    if (cloud) {
      cachedBoard = mergeLeaderboards(save.leaderboard, cloud);
    } else {
      lastError = true;
      if (!cachedBoard) {
        cachedBoard = mergeLeaderboards(save.leaderboard, []);
      }
    }
    lastFetch = Date.now();
    loading = false;
  });
}

export function enterLeaderboard() {
  populateFromCache();
  refreshLeaderboard(true);
}

export function drawLeaderboardScreen() {
  if (!cachedBoard) {
    populateFromCache();
    if (!loading) refreshLeaderboard(true);
  }

  drawMenuBackground();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const halo = ctx.createRadialGradient(W / 2, 66, 20, W / 2, 66, 320);
  halo.addColorStop(0, 'rgba(255,190,80,0.30)');
  halo.addColorStop(1, 'rgba(255,190,80,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(W / 2, 66, 320, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#ffd24a';
  ctx.shadowColor = 'rgba(255,150,40,0.6)';
  ctx.shadowBlur = 20;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('LEADERBOARD', W / 2, 58);
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255,220,150,0.72)';
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillText('Top 20 Bhakts across all devices', W / 2, 88);
  ctx.restore();

  drawOrnateLine(W / 2, 104, 400, 'rgba(255,210,74,0.4)');
  drawCoinPill(W - 90, 40, save.coins);

  const panelX = 40, panelY = 118, panelW = W - 80, panelH = 344;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 22;
  ctx.fillStyle = 'rgba(24,10,14,0.94)';
  rrect(panelX, panelY, panelW, panelH, 14);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,210,74,0.55)';
  ctx.lineWidth = 2;
  rrect(panelX, panelY, panelW, panelH, 14);
  ctx.stroke();

  const cols = {
    rank:    panelX + 18,
    name:    panelX + 56,
    score:   panelX + 200,
    seconds: panelX + 300,
    rounds:  panelX + 385,
    coins:   panelX + 475,
    scene:   panelX + 610,
    diff:    panelX + 680,
    date:    panelX + panelW - 18
  };

  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,210,120,0.8)';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('RANK',   cols.rank,    panelY + 22);
  ctx.fillText('BHAKT',  cols.name,    panelY + 22);
  ctx.fillText('SCORE',  cols.score,   panelY + 22);
  ctx.fillText('TIME',   cols.seconds, panelY + 22);
  ctx.fillText('ROUNDS', cols.rounds,  panelY + 22);
  ctx.fillText('COINS',  cols.coins,   panelY + 22);
  ctx.fillText('SCENE',  cols.scene,   panelY + 22);
  ctx.fillText('DIFF',   cols.diff,    panelY + 22);
  ctx.textAlign = 'right';
  ctx.fillText('DATE',   cols.date,    panelY + 22);
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,210,74,0.25)';
  ctx.beginPath();
  ctx.moveTo(panelX + 14, panelY + 38);
  ctx.lineTo(panelX + panelW - 14, panelY + 38);
  ctx.stroke();

  const lb = cachedBoard || [];
  if (lb.length === 0) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,235,200,0.55)';
    ctx.font = 'italic 14px Georgia, serif';
    ctx.fillText('No players yet — be the first!', W / 2, panelY + panelH / 2);
    ctx.fillStyle = 'rgba(255,235,200,0.4)';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('Complete at least one round to appear here.', W / 2, panelY + panelH / 2 + 26);
    ctx.restore();
  } else {
    const rowH = 26;
    for (let i = 0; i < lb.length && i < 11; i++) {
      const e = lb[i];
      const rowY = panelY + 56 + i * rowH;

      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(255,210,74,0.05)';
        rrect(panelX + 10, rowY - 11, panelW - 20, rowH - 2, 6);
        ctx.fill();
      }

      const scene = SCENES[e.scene] || SCENES.night;
      const diff = DIFFICULTIES[e.difficulty] || DIFFICULTIES.medium;

      ctx.save();
      ctx.textBaseline = 'middle';

      let rankCol = '#ffe9b0';
      if (i === 0) rankCol = '#ffd24a';
      else if (i === 1) rankCol = '#d8d8e8';
      else if (i === 2) rankCol = '#c8905a';
      ctx.fillStyle = rankCol;
      ctx.font = 'bold 13px Georgia, serif';
      ctx.textAlign = 'left';
      const medal = i === 0 ? '1' : i === 1 ? '2' : i === 2 ? '3' : String(i + 1);
      ctx.fillText(medal, cols.rank, rowY);

      ctx.fillStyle = '#ffe9b0';
      ctx.font = 'bold 11px Georgia, serif';
      const name = (e.name || 'Anonymous').slice(0, 14);
      ctx.fillText(name, cols.name, rowY);

      ctx.fillStyle = '#ffd24a';
      ctx.font = 'bold 12px Georgia, serif';
      ctx.fillText((e.score || 0) + 'm', cols.score, rowY);

      ctx.fillStyle = 'rgba(255,220,180,0.9)';
      ctx.font = 'bold 10.5px system-ui, sans-serif';
      ctx.fillText((e.seconds || 0) + 's', cols.seconds, rowY);

      const rc = e.roundsCompleted || 0;
      const rCol = rc >= 5 ? '#a8e6a0' : rc >= 3 ? '#ffd24a' : '#ff8a8a';
      ctx.fillStyle = rCol;
      ctx.font = 'bold 11px Georgia, serif';
      ctx.fillText(rc + '/5', cols.rounds, rowY);

      ctx.fillStyle = '#ffd24a';
      ctx.font = 'bold 11px Georgia, serif';
      ctx.fillText((e.coinsHeld || 0) + 'c', cols.coins, rowY);

      ctx.fillStyle = scene.color;
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText(scene.icon, cols.scene, rowY);

      const dcw = 44, dch = 15;
      const dcx = cols.diff, dcy = rowY;
      ctx.fillStyle = `rgba(${diff.colorRGB},0.20)`;
      rrect(dcx, dcy - dch / 2, dcw, dch, 5);
      ctx.fill();
      ctx.strokeStyle = diff.color;
      ctx.lineWidth = 1;
      rrect(dcx, dcy - dch / 2, dcw, dch, 5);
      ctx.stroke();
      ctx.fillStyle = diff.color;
      ctx.font = 'bold 8px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(diff.name, dcx + dcw / 2, dcy + 1);

      ctx.fillStyle = 'rgba(255,235,200,0.5)';
      ctx.font = '9px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText((e.date || '').slice(0, 10), cols.date, rowY);

      ctx.restore();
    }
  }

  /* Status below the panel */
  const statusY = panelY + panelH + 14;
  if (loading) {
    ctx.save();
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 300);
    ctx.globalAlpha = 0.6 + pulse * 0.3;
    ctx.fillStyle = '#ffd24a';
    ctx.font = 'italic 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('refreshing…', W / 2, statusY);
    ctx.restore();
    } else if (lastError) {
    ctx.save();
    ctx.fillStyle = 'rgba(180,90,40,0.85)';
    ctx.font = 'italic 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'cloud not reachable — try disabling ad blocker for this site',
      W / 2, statusY
    );
    ctx.restore();
  }
  drawButtons();
}