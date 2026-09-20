import { ctx, W, H } from '../core/canvas.js';
import { ui, state } from '../core/state.js';
import { save } from '../core/save.js';
import { OUTFITS } from '../data/outfits.js';
import { rrect } from '../util/drawing.js';
import { getCurrentButtons, getPurchaseModalRects, getBackButton } from './registry.js';
import { drawSceneCard, drawDiffCard, drawOutfitCard } from './cards.js';
import { isMuted } from '../core/audio.js';
import { drawMiniCharacter } from '../player/draw.js';

export function drawButton(b, hovered) {
  const { x, y, w, h, label, accent } = b;
  const disabled = !!b.disabled;
  const scale = (hovered && !disabled) ? 1.05 : 1.0;
  const cx = x + w/2, cy = y + h/2;
  const col = accent || '#ffd24a';

  ctx.save();
  ctx.translate(cx, cy); ctx.scale(scale, scale); ctx.translate(-cx, -cy);
  if (hovered && !disabled) { ctx.shadowColor = col; ctx.shadowBlur = 32; }
  else { ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 14; }

  const g = ctx.createLinearGradient(x, y, x, y + h);
  if (disabled) { g.addColorStop(0, 'rgba(28,22,18,0.92)'); g.addColorStop(1, 'rgba(14,10,8,0.96)'); }
  else if (hovered) {
    g.addColorStop(0, 'rgba(78,40,18,0.98)');
    g.addColorStop(0.5, 'rgba(52,26,10,0.98)');
    g.addColorStop(1, 'rgba(30,14,4,0.98)');
  } else {
    g.addColorStop(0, 'rgba(38,18,24,0.92)');
    g.addColorStop(1, 'rgba(16,7,13,0.96)');
  }
  ctx.fillStyle = g;
  rrect(x, y, w, h, 12); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = disabled ? 'rgba(140,120,80,0.32)' : (hovered ? col : 'rgba(255,210,74,0.42)');
  ctx.lineWidth = (hovered && !disabled) ? 2.4 : 1.6;
  rrect(x, y, w, h, 12); ctx.stroke();

  ctx.fillStyle = disabled ? 'rgba(210,190,140,0.55)' : (hovered ? '#fff8d0' : col);
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 1);
  ctx.restore();
}

function drawMuteButton(b, hovered) {
  const { x, y, w, h } = b;
  const muted = isMuted();
  const cx = x + w/2, cy = y + h/2;
  const accent = muted ? '#ff8a8a' : '#ffd24a';

  ctx.save();
  if (hovered) { ctx.shadowColor = accent; ctx.shadowBlur = 22; }
  else { ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 12; }

  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, 'rgba(38,18,24,0.92)');
  g.addColorStop(1, 'rgba(16,7,13,0.96)');
  ctx.fillStyle = g;
  rrect(x, y, w, h, 10); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = hovered ? accent : 'rgba(255,210,74,0.5)';
  ctx.lineWidth = hovered ? 2.2 : 1.4;
  rrect(x, y, w, h, 10); ctx.stroke();

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 3);
  ctx.lineTo(cx - 3, cy - 3);
  ctx.lineTo(cx + 1, cy - 7);
  ctx.lineTo(cx + 1, cy + 7);
  ctx.lineTo(cx - 3, cy + 3);
  ctx.lineTo(cx - 8, cy + 3);
  ctx.closePath();
  ctx.fill();

  if (muted) {
    ctx.strokeStyle = '#ff5b5b';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 6);
    ctx.lineTo(cx + 12, cy + 6);
    ctx.stroke();
  } else {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx + 1, cy, 5, -0.6, 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 1, cy, 8, -0.6, 0.6);
    ctx.stroke();
  }
  ctx.restore();
}

/* User icon (avatar circle) + name pill — main menu, top-left */
function drawUserButton(b, hovered) {
  const { x, y, w, h } = b;
  const name = (save.playerName || '').trim();
  const cx = x + 20, cy = y + h / 2;
  const accent = '#ffd24a';

  ctx.save();
  if (name) {
    ctx.shadowColor = hovered ? accent : 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = hovered ? 18 : 8;
    ctx.fillStyle = 'rgba(20,10,6,0.88)';
    rrect(x + 16, y + 6, w - 16, h - 12, 14); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = hovered ? accent : 'rgba(255,210,74,0.6)';
    ctx.lineWidth = hovered ? 2 : 1.5;
    rrect(x + 16, y + 6, w - 16, h - 12, 14); ctx.stroke();

    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,210,120,0.85)';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('BHAKT', x + 48, cy + 1);

    /* shrink long names to fit the pill */
    let px = 14;
    ctx.font = 'bold ' + px + 'px Georgia, serif';
    while (px > 10 && ctx.measureText(name).width > w - 100 - 12) {
      px -= 1; ctx.font = 'bold ' + px + 'px Georgia, serif';
    }
    ctx.fillStyle = accent;
    ctx.fillText(name, x + 96, cy + 1);
  }

  /* avatar circle */
  ctx.shadowColor = hovered ? accent : 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = hovered ? 22 : 10;
  const g = ctx.createLinearGradient(cx, cy - 18, cx, cy + 18);
  g.addColorStop(0, hovered ? 'rgba(78,40,18,0.98)' : 'rgba(46,22,30,0.96)');
  g.addColorStop(1, hovered ? 'rgba(30,14,4,0.98)'  : 'rgba(18,8,14,0.98)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hovered ? accent : 'rgba(255,210,74,0.75)';
  ctx.lineWidth = hovered ? 2.4 : 1.8;
  ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.stroke();

  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, 16.5, 0, Math.PI * 2); ctx.clip();
  if (name) {
    /* equipped outfit as the profile picture */
    const o = OUTFITS[save.selectedOutfit] || OUTFITS.classic;
    drawMiniCharacter(cx, cy + 40 * 0.7 - 3, o, 0.7);
  } else {
    /* no player yet: generic person glyph (head + shoulders) */
    ctx.fillStyle = hovered ? '#fff8d0' : accent;
    ctx.beginPath(); ctx.arc(cx, cy - 4.5, 5.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, cy + 14, 11, 9, 0, Math.PI, 0); ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

function drawBackButton(b, hovered) {
  const { x, y, w, h } = b;
  const cy = y + h / 2;
  const accent = '#ffd24a';

  ctx.save();
  if (hovered) { ctx.shadowColor = accent; ctx.shadowBlur = 22; }
  else { ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 12; }

  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, hovered ? 'rgba(78,40,18,0.98)' : 'rgba(38,18,24,0.92)');
  g.addColorStop(1, hovered ? 'rgba(30,14,4,0.98)'  : 'rgba(16,7,13,0.96)');
  ctx.fillStyle = g;
  rrect(x, y, w, h, 10); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = hovered ? accent : 'rgba(255,210,74,0.5)';
  ctx.lineWidth = hovered ? 2.2 : 1.4;
  rrect(x, y, w, h, 10); ctx.stroke();

  /* chevron */
  ctx.strokeStyle = hovered ? '#fff8d0' : accent;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 24, cy - 7);
  ctx.lineTo(x + 16, cy);
  ctx.lineTo(x + 24, cy + 7);
  ctx.stroke();

  /* label */
  ctx.fillStyle = hovered ? '#fff8d0' : accent;
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('BACK', x + 36, cy + 1);
  ctx.restore();
}

/* Used during live gameplay, where the normal button layer isn't drawn */
export function drawBackButtonOnly() {
  const b = getBackButton();
  if (b) drawBackButton(b, ui.hoveredId === b.id);
}

/* Purchase confirmation modal — drawn behind the modal buttons */
function drawPurchaseModal() {
  const key = state.pendingPurchase;
  if (!key) return;
  const outfit = OUTFITS[key];
  if (!outfit) return;

  /* Dim the whole scene */
  ctx.fillStyle = 'rgba(4, 2, 12, 0.86)';
  ctx.fillRect(0, 0, W, H);

  const r = getPurchaseModalRects();

  /* Card */
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 32;
  ctx.fillStyle = 'rgba(24, 10, 8, 0.98)';
  rrect(r.cx, r.cy, r.cw, r.ch, 16);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,210,74,0.85)';
  ctx.lineWidth = 2.5;
  rrect(r.cx, r.cy, r.cw, r.ch, 16);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,210,74,0.28)';
  ctx.lineWidth = 1;
  rrect(r.cx + 6, r.cy + 6, r.cw - 12, r.ch - 12, 12);
  ctx.stroke();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  /* Title */
  ctx.fillStyle = '#ffd24a';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('CONFIRM PURCHASE', W / 2, r.cy + 38);

  /* Subtitle — outfit name */
  ctx.fillStyle = 'rgba(255, 235, 200, 0.75)';
  ctx.font = 'italic 15px Georgia, serif';
  ctx.fillText(outfit.name, W / 2, r.cy + 74);

  /* Cost */
  ctx.fillStyle = '#ffd24a';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('\u20B2 ' + outfit.cost, W / 2, r.cy + 118);

  /* Balance after */
  const after = Math.max(0, save.coins - outfit.cost);
  ctx.fillStyle = 'rgba(168, 230, 160, 0.9)';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Balance after: \u20B2 ' + after, W / 2, r.cy + 152);

  ctx.restore();
}

export function drawButtons() {
  /* Modal overlay + card drawn first, then modal buttons on top */
  if (state.pendingPurchase) drawPurchaseModal();

  for (const b of getCurrentButtons()) {
    if (b.muteButton) {
      drawMuteButton(b, ui.hoveredId === b.id);
    } else if (b.backButton) {
      drawBackButton(b, ui.hoveredId === b.id);
    } else if (b.userButton) {
      drawUserButton(b, ui.hoveredId === b.id);
    } else if (b.card && b.sceneKey) {
      drawSceneCard(b, ui.hoveredId === b.id);
    } else if (b.card && b.diffKey) {
      drawDiffCard(b, ui.hoveredId === b.id);
    } else if (b.outfitCard) {
      drawOutfitCard(b, ui.hoveredId === b.id);
    } else {
      drawButton(b, ui.hoveredId === b.id);
    }
  }
}