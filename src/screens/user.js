import { ctx, W } from '../core/canvas.js';
import { save, getPlayerStats } from '../core/save.js';
import { OUTFITS } from '../data/outfits.js';
import { SCENES, SCENE_ORDER } from '../data/scenes.js';
import { DIFFICULTIES } from '../data/difficulties.js';
import { drawMenuBackground } from './_background.js';
import { drawOrnateLine, drawCoinPill, rrect } from '../util/drawing.js';
import { drawButtons } from '../ui/buttons.js';
import { drawMiniCharacter } from '../player/draw.js';
import { fetchLeaderboard, getCachedBoard } from '../cloud.js';

/* ============================================================
   USER / PLAYER PROFILE PAGE
   Everything the game knows about the current player name:
     - identity, coins, outfit, scenes unlocked, next goal
     - best run per difficulty (online leaderboard + this device)
     - lifetime stats for this name (tracked in core/save.js)
   The player NAME is the ID — the leaderboard matches rows by name.
   ============================================================ */

const GOLD = '#ffd24a';
const DIFF_KEYS = ['easy', 'medium', 'hard'];

/* ---- Cloud data (same source as the leaderboard) ---- */
let rows = null;
let loading = false;
let lastFetch = 0;
let lastError = false;
let lastSyncAt = 0;

export function refreshUserData(force = false) {
  if (loading) return;
  if (!force && Date.now() - lastFetch < 3000 && rows) return;

  loading = true;
  lastError = false;
  fetchLeaderboard()
    .then(cloud => {
      if (cloud) { rows = cloud; lastSyncAt = Date.now(); }
      else lastError = true;
    })
    .catch(() => { lastError = true; })
    .then(() => { lastFetch = Date.now(); loading = false; });
}

export function enterUserPage() {
  rows = getCachedBoard();
  refreshUserData(true);
}

/* ---- Helpers ---- */
const keyOf = n => String(n || '').trim().toLowerCase();

function better(a, b) {            // is run `a` better than run `b`?
  if (a.rounds !== b.rounds) return a.rounds > b.rounds;
  return a.time < b.time;
}

function recordFor(diff) {
  const me = keyOf(save.playerName);
  const pool = rows ? rows.filter(r => r.difficulty === diff) : [];
  const mine = pool
    .filter(r => keyOf(r.name) === me)
    .sort((a, b) => (better(a, b) ? -1 : 1))[0] || null;

  const stats = getPlayerStats(save.playerName);
  const local = stats && stats.best ? stats.best[diff] : null;

  if (mine && (!local || !better(local, mine))) {
    const rank = 1 + pool.filter(r => better(r, mine)).length;
    return { rounds: mine.rounds, time: mine.time, when: mine.lastUpdated,
             source: 'online', rank, total: pool.length };
  }
  if (local) return { rounds: local.rounds, time: local.time, when: local.date, source: 'device' };
  return null;
}

function fmtDuration(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  if (sec < 60) return sec + 's';
  if (sec < 3600) return Math.floor(sec / 60) + 'm ' + (sec % 60) + 's';
  return Math.floor(sec / 3600) + 'h ' + Math.floor((sec % 3600) / 60) + 'm';
}

function fmtDate(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function fitFont(text, maxW, px, weight, family, minPx = 10) {
  let s = px;
  for (;;) {
    ctx.font = weight + ' ' + s + 'px ' + family;
    if (ctx.measureText(text).width <= maxW || s <= minPx) break;
    s -= 1;
  }
}

function wrap(text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function nextGoal() {
  for (const k of SCENE_ORDER) {
    if (!save.unlockedScenes[k]) {
      const prev = SCENES[SCENE_ORDER[SCENE_ORDER.indexOf(k) - 1]];
      return 'Complete all 5 rounds of ' + prev.name + ' to unlock ' + SCENES[k].name + '.';
    }
  }
  const next = Object.values(OUTFITS)
    .filter(o => !save.ownedOutfits.includes(o.key))
    .sort((a, b) => a.cost - b.cost)[0];
  if (next) {
    const need = next.cost - save.coins;
    return need > 0
      ? 'Save up for ' + next.name + ' — ' + need + ' more coins to go.'
      : 'You can afford ' + next.name + ' (' + next.cost + ' coins). Visit the Outfit Shop!';
  }
  return 'Everything unlocked! Climb to the top of the Hard leaderboard.';
}

/* ---- Drawing pieces ---- */
function panel(x, y, w, h, title, accent) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 16;
  ctx.fillStyle = 'rgba(18,8,16,0.88)';
  rrect(x, y, w, h, 14); ctx.fill();
  ctx.restore();

  ctx.strokeStyle = accent; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.6;
  rrect(x, y, w, h, 14); ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = accent;
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(title, x + w / 2, y + 20);

  ctx.strokeStyle = accent; ctx.globalAlpha = 0.28; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 16, y + 34); ctx.lineTo(x + w - 16, y + 34); ctx.stroke();
  ctx.globalAlpha = 1;
}

function statRow(x, y, w, label, value, valueColor) {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,220,150,0.72)';
  ctx.font = 'bold 10.5px system-ui, sans-serif';
  ctx.fillText(label, x, y);

  ctx.textAlign = 'right';
  ctx.fillStyle = valueColor || GOLD;
  fitFont(String(value), w - 130, 14, 'bold', 'Georgia, serif', 10);
  ctx.fillText(String(value), x + w, y);
}

function drawAvatar(cx, cy, r, letter) {   // letter is only used when no player exists yet
  const o = OUTFITS[save.selectedOutfit] || OUTFITS.classic;

  const halo = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 2.2);
  halo.addColorStop(0, 'rgba(255,190,80,0.35)');
  halo.addColorStop(1, 'rgba(255,190,80,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2); ctx.fill();

  const bg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 2, cx, cy, r);
  bg.addColorStop(0, '#3a1c28'); bg.addColorStop(1, '#140812');
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ring.addColorStop(0, o.swatch1); ring.addColorStop(1, o.swatch2);
  ctx.strokeStyle = ring; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

  if (letter === '?') {
    ctx.fillStyle = GOLD;
    ctx.font = 'bold ' + Math.round(r * 1.05) + 'px Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(letter, cx, cy + 2);
    return;
  }

  /* Profile picture = the outfit the player currently has equipped */
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r - 2, 0, Math.PI * 2); ctx.clip();
  const s = r / 24;                       // character is ~65 units tall; frame head + torso
  drawMiniCharacter(cx, cy + 40 * s - 4, o, s * 1.02);
  ctx.restore();
}

function drawIdentityPanel(x, y, w, h) {
  panel(x, y, w, h, 'PLAYER', GOLD);
  const name = (save.playerName || '').trim();
  const cx = x + w / 2;

  drawAvatar(cx, y + 78, 32, name.charAt(0).toUpperCase() || '?');

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,210,120,0.8)';
  ctx.font = 'bold 10px Georgia, serif';
  ctx.fillText('B  H  A  K  T', cx, y + 128);
  ctx.fillStyle = GOLD;
  fitFont(name, w - 36, 24, 'bold', 'Georgia, serif', 13);
  ctx.fillText(name, cx, y + 152);
  ctx.fillStyle = 'rgba(255,220,150,0.5)';
  ctx.font = 'italic 9.5px Georgia, serif';
  ctx.fillText('name is permanent', cx, y + 166);

  ctx.strokeStyle = 'rgba(255,210,74,0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 16, y + 176); ctx.lineTo(x + w - 16, y + 176); ctx.stroke();

  const o = OUTFITS[save.selectedOutfit] || OUTFITS.classic;
  const unlockedCount = SCENE_ORDER.filter(k => save.unlockedScenes[k]).length;
  const rx = x + 16, rw = w - 32;
  statRow(rx, y + 194, rw, 'COINS', '₲ ' + save.coins);
  statRow(rx, y + 218, rw, 'OUTFIT', o.name);
  statRow(rx, y + 242, rw, 'OUTFITS OWNED', save.ownedOutfits.length + ' / ' + Object.keys(OUTFITS).length);
  statRow(rx, y + 266, rw, 'SCENES UNLOCKED', unlockedCount + ' / ' + SCENE_ORDER.length);

  /* Next goal */
  const gy = y + 284, gh = h - 284 - 8;
  ctx.fillStyle = 'rgba(255,210,74,0.08)';
  rrect(x + 12, gy, w - 24, gh, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,74,0.28)'; ctx.lineWidth = 1;
  rrect(x + 12, gy, w - 24, gh, 8); ctx.stroke();

  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.fillText('NEXT GOAL', x + 22, gy + 13);
  ctx.fillStyle = 'rgba(255,240,215,0.92)';
  ctx.font = '12px system-ui, sans-serif';
  const lines = wrap(nextGoal(), w - 44).slice(0, 3);
  lines.forEach((ln, i) => ctx.fillText(ln, x + 22, gy + 30 + i * 16));
}

function drawRecordBlock(x, y, w, h, diffKey) {
  const d = DIFFICULTIES[diffKey];
  const rec = recordFor(diffKey);

  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  rrect(x, y, w, h, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(' + d.colorRGB + ',0.45)'; ctx.lineWidth = 1.2;
  rrect(x, y, w, h, 10); ctx.stroke();
  ctx.fillStyle = d.color;
  rrect(x, y + 6, 4, h - 12, 2); ctx.fill();

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = d.color;
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText(d.icon + '  ' + d.name, x + 16, y + 16);

  if (!rec) {
    ctx.fillStyle = 'rgba(255,235,200,0.55)';
    ctx.font = 'italic 12px Georgia, serif';
    ctx.fillText('No run yet — finish a round to set one.', x + 16, y + 52);
    return;
  }

  ctx.textAlign = 'right';
  ctx.font = 'bold 9.5px system-ui, sans-serif';
  ctx.fillStyle = rec.source === 'online' ? '#a8e6a0' : '#7ee0ff';
  ctx.fillText(rec.source === 'online' ? 'ONLINE' : 'THIS DEVICE', x + w - 12, y + 16);

  ctx.textAlign = 'left';
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(rec.rounds + '/5', x + 16, y + 46);
  ctx.fillStyle = 'rgba(255,220,150,0.6)';
  ctx.font = 'bold 9.5px system-ui, sans-serif';
  ctx.fillText('ROUNDS', x + 16, y + 65);

  ctx.fillStyle = '#fff2c8';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(fmtDuration(rec.time), x + 106, y + 46);
  ctx.fillStyle = 'rgba(255,220,150,0.6)';
  ctx.font = 'bold 9.5px system-ui, sans-serif';
  ctx.fillText('TIME', x + 106, y + 65);

  if (rec.source === 'online') {
    ctx.fillStyle = '#a8e6a0';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText('#' + rec.rank, x + 196, y + 46);
    ctx.fillStyle = 'rgba(255,220,150,0.6)';
    ctx.font = 'bold 9.5px system-ui, sans-serif';
    ctx.fillText('RANK OF ' + rec.total, x + 196, y + 65);
  }

  const when = fmtDate(rec.when);
  if (when) {
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,235,200,0.42)';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(when, x + w - 12, y + h - 10);
  }
}

function drawRecordsPanel(x, y, w, h) {
  panel(x, y, w, h, 'BEST RUNS', '#ffb84d');
  const bh = 88, gap = 8;
  for (let i = 0; i < DIFF_KEYS.length; i++) {
    drawRecordBlock(x + 12, y + 44 + i * (bh + gap), w - 24, bh, DIFF_KEYS[i]);
  }

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'italic 11px Georgia, serif';
  ctx.fillStyle = 'rgba(255,235,200,0.5)';
  let msg = '';
  if (loading) msg = 'syncing with the cloud…';
  else if (lastError) msg = 'cloud not reachable — showing this device only';
  else if (lastSyncAt) msg = 'synced ' + new Date(lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (msg) ctx.fillText(msg, x + w / 2, y + h - 14);
}

function drawLifetimePanel(x, y, w, h) {
  panel(x, y, w, h, 'LIFETIME  ·  THIS DEVICE', '#7ee0ff');
  const st = getPlayerStats(save.playerName);
  const rx = x + 16, rw = w - 32;

  const list = [
    ['RUNS PLAYED',        st ? st.runs : 0],
    ['POOJAS COMPLETED',   st ? st.wins : 0],
    ['MODAKS DELIVERED',   st ? st.delivered : 0],
    ['DISTANCE RUN',       (st ? st.distance : 0) + ' m'],
    ['COINS COLLECTED',    '₲ ' + (st ? st.coins : 0)],
    ['TIME PLAYED',        fmtDuration(st ? st.seconds : 0)],
    ['LAST PLAYED',        st && st.lastPlayed ? fmtDate(st.lastPlayed) : '—'],
  ];
  list.forEach(([label, value], i) => statRow(rx, y + 54 + i * 25, rw, label, value));

  ctx.strokeStyle = 'rgba(126,224,255,0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 16, y + 240); ctx.lineTo(x + w - 16, y + 240); ctx.stroke();

  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#7ee0ff';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.fillText('BEST DISTANCE BY SCENE', rx, y + 258);

  SCENE_ORDER.forEach((k, i) => {
    const sc = SCENES[k];
    const open = save.unlockedScenes[k];
    const best = save.bestScores[k] || 0;
    const ry = y + 282 + i * 24;
    ctx.textAlign = 'left';
    ctx.fillStyle = open ? sc.color : 'rgba(255,235,200,0.35)';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText(sc.icon + '  ' + sc.name, rx, ry);
    ctx.textAlign = 'right';
    ctx.fillStyle = open ? (best > 0 ? GOLD : 'rgba(255,235,200,0.5)') : 'rgba(255,235,200,0.35)';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.fillText(open ? (best > 0 ? best + ' m' : '—') : 'LOCKED', rx + rw, ry);
  });
}

function drawEmptyState() {
  const cw = 520, ch = 250;
  const x = W / 2 - cw / 2, y = 128;
  panel(x, y, cw, ch, 'NO PLAYER YET', GOLD);
  drawAvatar(W / 2, y + 98, 34, '?');

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,240,215,0.9)';
  ctx.font = '14px system-ui, sans-serif';
  const msg = 'Press PLAY, choose a scene and difficulty, then enter your name (it can never be changed). ' +
              'Your profile, best runs and stats will appear here.';
  wrap(msg, cw - 80).forEach((ln, i) => ctx.fillText(ln, W / 2, y + 168 + i * 22));
}

/* ---- Screen ---- */
export function drawUserScreen() {
  if (!rows) {
    rows = getCachedBoard();
    if (!loading) refreshUserData(true);
  }

  drawMenuBackground();

  const name = (save.playerName || '').trim();

  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const halo = ctx.createRadialGradient(W / 2, 66, 20, W / 2, 66, 320);
  halo.addColorStop(0, 'rgba(255,170,60,0.30)');
  halo.addColorStop(1, 'rgba(255,170,60,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(W / 2, 66, 320, 0, Math.PI * 2); ctx.fill();

  const tg = ctx.createLinearGradient(0, 40, 0, 78);
  tg.addColorStop(0, '#fff6d0'); tg.addColorStop(0.5, GOLD); tg.addColorStop(1, '#e8a020');
  ctx.fillStyle = tg;
  ctx.shadowColor = 'rgba(255,150,40,0.55)'; ctx.shadowBlur = 20;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('PLAYER PROFILE', W / 2, 58);
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255,220,150,0.78)';
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillText(name ? 'Everything Bappa knows about ' + name : 'Your journey starts here', W / 2, 86);
  ctx.restore();

  drawOrnateLine(W / 2, 100, 400, 'rgba(255,210,74,0.4)');
  drawCoinPill(W - 90, 40, save.coins);

  if (name) {
    drawIdentityPanel(30, 116, 280, 352);
    drawRecordsPanel(326, 116, 308, 352);
    drawLifetimePanel(650, 116, 280, 352);
  } else {
    drawEmptyState();
  }

  drawButtons();
}