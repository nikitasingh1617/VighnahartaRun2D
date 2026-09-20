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
  halo.addColorStop(0, 'rgba(255,220,160,0.35)');
  halo.addColorStop(1, 'rgba(255,220,160,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(W / 2, 66, 320, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#fff4d8';
  ctx.shadowColor = 'rgba(120,60,20,0.85)';
  ctx.shadowBlur = 16;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('LEADERBOARD', W / 2, 58);
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255,240,210,0.9)';
  ctx.shadowColor = 'rgba(120,60,20,0.7)';
  ctx.shadowBlur = 10;
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillText('Top 10 Bhakts per difficulty — ranked by rounds, then time', W / 2, 88);
  ctx.shadowBlur = 0;
  ctx.restore();

  drawOrnateLine(W / 2, 104, 420, 'rgba(255,220,150,0.75)');
  drawCoinPill(W - 90, 40, save.coins);

  /* Panel — softer cream instead of near-white */
  const panelX = 40, panelY = 118, panelW = W - 80, panelH = 344;
  ctx.save();
  ctx.shadowColor = 'rgba(60,30,10,0.55)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 4;
  const pg = ctx.createLinearGradient(0, panelY, 0, panelY + panelH);
  pg.addColorStop(0, 'rgba(252,240,215,0.94)');
  pg.addColorStop(1, 'rgba(245,224,190,0.94)');
  ctx.fillStyle = pg;
  rrect(panelX, panelY, panelW, panelH, 14);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(200,120,24,0.75)'; ctx.lineWidth = 2;
  rrect(panelX, panelY, panelW, panelH, 14); ctx.stroke();
  ctx.strokeStyle = 'rgba(200,120,24,0.25)'; ctx.lineWidth = 1;
  rrect(panelX + 6, panelY + 6, panelW - 12, panelH - 12, 10); ctx.stroke();

  /* 3 columns */
  const pad = 20;
  const gap = 12;
  const colW = (panelW - pad * 2 - gap * 2) / 3;
  const colX = [panelX + pad, panelX + pad + colW + gap, panelX + pad + (colW + gap) * 2];
  const colY = panelY + 14;
  const colH = panelH - 28;

  const groups = groupByDifficulty(cachedRows);

  drawColumn(colX[0], colY, colW, colH, 'EASY',   '#3a9e4a', '#e8f8e8', '#2a6e30', groups.easy);
  drawColumn(colX[1], colY, colW, colH, 'MEDIUM', '#e08a28', '#fdf0d0', '#a05c10', groups.medium);
  drawColumn(colX[2], colY, colW, colH, 'HARD',   '#c84848', '#fce0e0', '#8a2828', groups.hard);

  /* Status */
  const statusY = panelY + panelH + 14;
  if (loading) {
    ctx.save();
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 300);
    ctx.globalAlpha = 0.75 + pulse * 0.25;
    ctx.fillStyle = '#fff4d8';
    ctx.shadowColor = 'rgba(120,60,20,0.85)';
    ctx.shadowBlur = 8;
    ctx.font = 'italic 11px Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('refreshing…', W / 2, statusY);
    ctx.restore();
  } else if (lastError) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,220,190,0.95)';
    ctx.shadowColor = 'rgba(120,40,20,0.85)';
    ctx.shadowBlur = 8;
    ctx.font = 'italic 11px Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('cloud not reachable — try disabling ad blocker for this site', W / 2, statusY);
    ctx.restore();
  }

  drawButtons();
}

function drawColumn(x, y, w, h, label, accent, accentLight, darkText, rows) {
  /* Header — muted band with soft gradient */
  const hg = ctx.createLinearGradient(0, y, 0, y + 28);
  hg.addColorStop(0, accent);
  hg.addColorStop(1, shade(accent, -0.15));
  ctx.fillStyle = hg;
  rrect(x, y, w, 28, 7); ctx.fill();

  /* Highlight line under header */
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 27);
  ctx.lineTo(x + w - 8, y + 27);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 4;
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + 15);
  ctx.shadowBlur = 0;

  /* Column body background */
  ctx.fillStyle = accentLight;
  rrect(x, y + 28, w, h - 28, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(200,120,24,0.35)';
  ctx.lineWidth = 1;
  rrect(x, y + 28, w, h - 28, 7); ctx.stroke();

  /* Rank rows */
  const ranked = rankRows(rows);
  const rowTop = y + 34;
  const rowH = 28;

  if (ranked.length === 0) {
    ctx.fillStyle = 'rgba(140,90,40,0.55)';
    ctx.font = 'italic 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('no runs yet', x + w / 2, rowTop + 40);
    return;
  }

  for (let i = 0; i < 10; i++) {
    const ry = rowTop + i * rowH;
    if (ry + rowH > y + h) break;

    /* Zebra */
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(255,240,200,0.5)';
      rrect(x + 5, ry, w - 10, rowH - 2, 5);
      ctx.fill();
    }

    if (i >= ranked.length) continue;
    const p = ranked[i];

    /* Rank medal */
    const badgeCol = i === 0 ? '#ffd24a'
                   : i === 1 ? '#dcdce8'
                   : i === 2 ? '#e0a868'
                   : 'rgba(200,150,90,0.45)';

    /* Glow behind top-3 */
    if (i < 3) {
      const gl = ctx.createRadialGradient(x + 15, ry + 14, 2, x + 15, ry + 14, 14);
      gl.addColorStop(0, i === 0 ? 'rgba(255,210,80,0.65)' : 'rgba(220,220,240,0.5)');
      gl.addColorStop(1, 'rgba(255,210,80,0)');
      ctx.fillStyle = gl;
      ctx.beginPath(); ctx.arc(x + 15, ry + 14, 14, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = badgeCol;
    ctx.beginPath();
    ctx.arc(x + 15, ry + 14, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140,80,20,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x + 15, ry + 14, 9, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = i < 3 ? '#5a2a00' : '#7a4a10';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), x + 15, ry + 15);

    /* Name + rounds */
    ctx.fillStyle = '#5a2a00';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'left';
    const name = (p.name || 'Anonymous').slice(0, 12);
    ctx.fillText(name, x + 30, ry + 10);

    ctx.fillStyle = p.rounds >= 5 ? '#2a7a3a' : '#a05808';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText(p.rounds + '/5', x + w - 10, ry + 10);

    /* Wallet + time */
    ctx.fillStyle = 'rgba(120,80,30,0.75)';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('₲ ' + p.coinsHeld, x + 30, ry + 22);

    ctx.textAlign = 'right';
    ctx.fillText(p.time + 's', x + w - 10, ry + 22);
  }
}

/* Darken or lighten a hex colour by factor (-1..1) */
function shade(hex, factor) {
  const c = hex.replace('#', '');
  const num = parseInt(c, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  if (factor < 0) {
    r = Math.round(r * (1 + factor));
    g = Math.round(g * (1 + factor));
    b = Math.round(b * (1 + factor));
  } else {
    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);
  }
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}