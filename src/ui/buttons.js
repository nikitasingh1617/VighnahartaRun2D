import { ctx, W, H } from '../core/canvas.js';
import { ui, state } from '../core/state.js';
import { save } from '../core/save.js';
import { OUTFITS } from '../data/outfits.js';
import { rrect } from '../util/drawing.js';
import { getCurrentButtons, getPurchaseModalRects } from './registry.js';
import { drawSceneCard, drawDiffCard, drawOutfitCard } from './cards.js';
import { isMuted } from '../core/audio.js';

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