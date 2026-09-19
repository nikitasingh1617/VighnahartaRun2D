import { ctx, W, H } from '../core/canvas.js';
import { ui } from '../core/state.js';
import { rrect } from '../util/drawing.js';
import { getCurrentButtons } from './registry.js';
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

/* Mute toggle — small square button with a speaker icon */
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
  rrect(x, y, w, h, 10);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = hovered ? accent : 'rgba(255,210,74,0.5)';
  ctx.lineWidth = hovered ? 2.2 : 1.4;
  rrect(x, y, w, h, 10);
  ctx.stroke();

  /* Speaker body */
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
    /* Slash */
    ctx.strokeStyle = '#ff5b5b';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 6);
    ctx.lineTo(cx + 12, cy + 6);
    ctx.stroke();
  } else {
    /* Sound waves */
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

export function drawButtons() {
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