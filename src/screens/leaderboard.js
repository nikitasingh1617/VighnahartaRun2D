import { ctx, W } from '../core/canvas.js';
import { drawMenuBackground } from './_background.js';
import { drawOrnateLine, drawCoinPill, rrect } from '../util/drawing.js';
import { save } from '../core/save.js';
import { drawButtons } from '../ui/buttons.js';
import { fetchLeaderboard, getCachedBoard } from '../cloud.js';

let cachedRows = null;
let loading = false;
let lastFetch = 0;
let lastError = false;

/* ------------------------------------------------------------
   Rank a list of rows — rounds desc, then time asc
   ------------------------------------------------------------ */
function rankRows(rows) {
  return rows.slice().sort((a, b) => {
    if (b.rounds !== a.rounds) return b.rounds - a.rounds;
    return a.time - b.time;
  }).slice(0, 10);
}

function groupByDifficulty(rows) {
  const groups = { easy: [], medium: [], hard: [] };
  if (!rows) return groups;
  for (const r of rows) {
    const d = (r.difficulty || '').toLowerCase();
    if (groups[d]) groups[d].push(r);
  }
  return groups;
}

/* Local rows fallback (from save.leaderboard) so there's always something */
function localRowsFor(difficulty) {
  /* save.leaderboard stores per-run records with a `rounds` field */
  return (save.leaderboard || [])
    .filter(r => r.rounds >= 1)
    .map(r => ({
      name: r.name,
      difficulty: difficulty,
      rounds: r.rounds,
      time: r.time,
      coinsHeld: r.coinsHeld
    }));
}

/* ------------------------------------------------------------
   Data loading
   ------------------------------------------------------------ */
function populateFromCache() {
  cachedRows = getCachedBoard();
}

export function refreshLeaderboard(force = false) {
  if (loading) return;
  if (!force && Date.now() - lastFetch < 3000 && cachedRows) return;

  loading = true;
  lastError = false;

  fetchLeaderboard().then(cloud => {
    if (cloud) {
      cachedRows = cloud;
    } else {
      lastError = true;
    }
    lastFetch = Date.now();
    loading = false;
  });
}

export function enterLeaderboard() {
  populateFromCache();
  refreshLeaderboard(true);
}

/* ------------------------------------------------------------
   Rendering
   ------------------------------------------------------------ */
export function drawLeaderboardScreen() {
  if (!cachedRows) {
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

  ctx.fillStyle = '#7a3a00';
  ctx.shadowColor = 'rgba(255,200,80,0.8)';
  ctx.shadowBlur = 20;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('LEADERBOARD', W / 2, 58);
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(120,80,40,0.7)';
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillText('Top 10 Bhakts per difficulty — ranked by rounds, then time', W / 2, 88);
  ctx.restore();

  drawOrnateLine(W / 2, 104, 420, 'rgba(200,120,24,0.6)');
  drawCoinPill(W - 90, 40, save.coins);

  /* Panel */
  const panelX = 40, panelY = 118, panelW = W - 80, panelH = 344;
  ctx.save();
  ctx.shadowColor = 'rgba(180,120,40,0.35)';
  ctx.shadowBlur = 22;
  ctx.fillStyle = 'rgba(255,250,240,0.96)';
  rrect(panelX, panelY, panelW, panelH, 14);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#e8a020'; ctx.lineWidth = 2;
  rrect(panelX, panelY, panelW, panelH, 14); ctx.stroke();

  /* 3 columns */
  const pad = 20;
  const gap = 12;
  const colW = (panelW - pad * 2 - gap * 2) / 3;
  const colX = [panelX + pad, panelX + pad + colW + gap, panelX + pad + (colW + gap) * 2];
  const colY = panelY + 12;
  const colH = panelH - 24;

  const groups = groupByDifficulty(cachedRows);

  drawColumn(colX[0], colY, colW, colH, 'easy',   'EASY',   '#2a8a3a', '#d8f5d8', groups.easy);
  drawColumn(colX[1], colY, colW, colH, 'medium', 'MEDIUM', '#c87818', '#ffe8b8', groups.medium);
  drawColumn(colX[2], colY, colW, colH, 'hard',   'HARD',   '#a82828', '#ffd8d8', groups.hard);

  /* Status */
  const statusY = panelY + panelH + 14;
  if (loading) {
    ctx.save();
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 300);
    ctx.globalAlpha = 0.6 + pulse * 0.3;
    ctx.fillStyle = '#a05808';
    ctx.font = 'italic 11px Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('refreshing…', W / 2, statusY);
    ctx.restore();
  } else if (lastError) {
    ctx.save();
    ctx.fillStyle = 'rgba(180,90,40,0.85)';
    ctx.font = 'italic 11px Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('cloud not reachable — try disabling ad blocker for this site', W / 2, statusY);
    ctx.restore();
  }

  drawButtons();
}

/* ------------------------------------------------------------
   One column
   ------------------------------------------------------------ */
function drawColumn(x, y, w, h, key, label, accent, accentLight, rows) {
  /* Header */
  const hg = ctx.createLinearGradient(0, y, 0, y + 26);
  hg.addColorStop(0, accent);
  hg.addColorStop(1, accent);
  ctx.fillStyle = hg;
  rrect(x, y, w, 26, 6); ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + 14);

  /* Rank rows */
  const ranked = rankRows(rows);
  const rowTop = y + 32;
  const rowH = 28;

  if (ranked.length === 0) {
    ctx.fillStyle = 'rgba(120,80,40,0.55)';
    ctx.font = 'italic 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('no runs yet', x + w / 2, rowTop + 40);
    return;
  }

  for (let i = 0; i < 10; i++) {
    const ry = rowTop + i * rowH;
    if (ry + rowH > y + h) break;

    /* zebra stripe */
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(255,210,120,0.14)';
      rrect(x + 4, ry, w - 8, rowH - 2, 5);
      ctx.fill();
    }

    if (i >= ranked.length) continue;

    const p = ranked[i];

    /* Rank badge */
    const badgeCol = i === 0 ? '#ffd24a'
                   : i === 1 ? '#c8c8d8'
                   : i === 2 ? '#d89858'
                   : 'rgba(200,150,90,0.55)';
    ctx.fillStyle = badgeCol;
    ctx.beginPath();
    ctx.arc(x + 15, ry + 14, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = i < 3 ? '#7a3a00' : '#fff';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), x + 15, ry + 15);

    /* Name + rounds (line 1) */
    ctx.fillStyle = '#7a3a00';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'left';
    const name = (p.name || 'Anonymous').slice(0, 12);
    ctx.fillText(name, x + 30, ry + 10);

    ctx.fillStyle = p.rounds >= 5 ? '#2a8a3a' : '#a05808';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText(p.rounds + '/5', x + w - 10, ry + 10);

    /* Time + wallet (line 2) */
    ctx.fillStyle = 'rgba(120,80,40,0.7)';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('₲ ' + p.coinsHeld, x + 30, ry + 22);

    ctx.textAlign = 'right';
    ctx.fillText(p.time + 's', x + w - 10, ry + 22);
  }
}