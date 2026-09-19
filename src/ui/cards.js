import { ctx, W } from '../core/canvas.js';
import { camera, state } from '../core/state.js';
import { SCENES } from '../data/scenes.js';
import { DIFFICULTIES } from '../data/difficulties.js';
import { OUTFITS } from '../data/outfits.js';
import { save } from '../core/save.js';
import { rrect } from '../util/drawing.js';
import { drawMiniCharacter } from '../player/draw.js';

export function drawSceneCard(b, hovered) {
  const { x, y, w, h } = b;
  const scene = SCENES[b.sceneKey];
  const unlocked = save.unlockedScenes[b.sceneKey];
  const cx = x + w / 2;
  const scale = (hovered && unlocked) ? 1.035 : 1.0;

  ctx.save();
  ctx.translate(cx, y + h / 2); ctx.scale(scale, scale); ctx.translate(-cx, -(y + h / 2));
  if (hovered && unlocked) { ctx.shadowColor = scene.color; ctx.shadowBlur = 40; }
  else { ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 22; }

  const bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, 'rgba(48,20,16,0.98)');
  bg.addColorStop(0.55, 'rgba(26,10,14,0.98)');
  bg.addColorStop(1, 'rgba(14,5,10,0.99)');
  ctx.fillStyle = bg; rrect(x, y, w, h, 18); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.save(); rrect(x, y, w, h, 18); ctx.clip();
  const bandH = 90;
  const sg = ctx.createLinearGradient(0, y, 0, y + bandH);
  scene.skyStops.forEach(([p, c]) => sg.addColorStop(p, c));
  ctx.fillStyle = sg; ctx.fillRect(x, y, w, bandH);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  for (let i = 0; i < 5; i++) {
    const bx = x + 12 + i * 52;
    const bh = 30 + ((i * 37) % 30);
    ctx.fillRect(bx, y + bandH - bh, 44, bh);
  }
  ctx.restore();

  const bar = ctx.createLinearGradient(x, 0, x + w, 0);
  bar.addColorStop(0, scene.color);
  bar.addColorStop(1, `rgba(${scene.colorRGB},0.5)`);
  ctx.fillStyle = bar;
  ctx.fillRect(x, y + bandH - 4, w, 4);

  ctx.strokeStyle = (hovered && unlocked) ? scene.color : 'rgba(255,210,90,0.42)';
  ctx.lineWidth = (hovered && unlocked) ? 2.6 : 1.6;
  rrect(x, y, w, h, 18); ctx.stroke();

  if (!unlocked) {
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    rrect(x, y, w, h, 18); ctx.fill();
    ctx.fillStyle = '#ffd24a';
    ctx.font = 'bold 42px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🔒', cx, y + bandH + 30);
    ctx.fillStyle = 'rgba(255,235,200,0.85)';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('COMPLETE PREVIOUS SCENE TO UNLOCK', cx, y + h - 30);
  } else {
    ctx.fillStyle = scene.color;
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(scene.icon, cx, y + bandH + 30);

    ctx.fillStyle = scene.color;
    ctx.font = 'bold 19px Georgia, serif';
    ctx.fillText(scene.name, cx, y + bandH + 62);

    ctx.fillStyle = 'rgba(255,235,200,0.7)';
    ctx.font = 'italic 12px Georgia, serif';
    ctx.fillText(scene.subtitle, cx, y + bandH + 82);

    ctx.fillStyle = 'rgba(255,210,74,0.85)';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('SCORE BONUS  ×' + scene.scoreMult.toFixed(2), cx, y + bandH + 108);

    const best = save.bestScores[b.sceneKey] || 0;
    if (best > 0) {
      ctx.fillStyle = 'rgba(255,240,215,0.9)';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('BEST: ' + best, cx, y + h - 22);
    }
  }
  ctx.restore();
}

export function drawDiffCard(b, hovered) {
  const { x, y, w, h } = b;
  const diff = DIFFICULTIES[b.diffKey];
  const cx = x + w / 2;
  const scale = hovered ? 1.035 : 1.0;

  ctx.save();
  ctx.translate(cx, y + h / 2); ctx.scale(scale, scale); ctx.translate(-cx, -(y + h / 2));
  if (hovered) { ctx.shadowColor = diff.color; ctx.shadowBlur = 40; }
  else { ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 22; }

  const bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, 'rgba(48,20,16,0.98)');
  bg.addColorStop(0.55, 'rgba(26,10,14,0.98)');
  bg.addColorStop(1, 'rgba(14,5,10,0.99)');
  ctx.fillStyle = bg; rrect(x, y, w, h, 18); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.save(); rrect(x, y, w, 8, 18); ctx.clip();
  const bar = ctx.createLinearGradient(x, 0, x + w, 0);
  bar.addColorStop(0, diff.color);
  bar.addColorStop(1, `rgba(${diff.colorRGB},0.5)`);
  ctx.fillStyle = bar;
  ctx.fillRect(x, y, w, 8);
  ctx.restore();

  ctx.strokeStyle = hovered ? diff.color : 'rgba(255,210,90,0.42)';
  ctx.lineWidth = hovered ? 2.6 : 1.6;
  rrect(x, y, w, h, 18); ctx.stroke();

  const iconCY = y + 62;
  const halo = ctx.createRadialGradient(cx, iconCY, 4, cx, iconCY, 44);
  halo.addColorStop(0, `rgba(${diff.colorRGB},0.30)`);
  halo.addColorStop(1, `rgba(${diff.colorRGB},0)`);
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(cx, iconCY, 44, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(${diff.colorRGB},0.16)`;
  ctx.beginPath(); ctx.arc(cx, iconCY, 30, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = diff.color; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(cx, iconCY, 30, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = diff.color;
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(diff.icon, cx, iconCY + 1);

  ctx.fillStyle = diff.color;
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText(diff.name, cx, y + 128);

  ctx.fillStyle = 'rgba(255,235,200,0.72)';
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillText(diff.tagline, cx, y + 152);

  ctx.strokeStyle = `rgba(${diff.colorRGB},0.35)`; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 40, y + 172); ctx.lineTo(x + w - 40, y + 172); ctx.stroke();

  const lines = diff.detail.split('\n');
  ctx.fillStyle = 'rgba(255,240,215,0.88)';
  ctx.font = '13px system-ui, sans-serif';
  for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], cx, y + 196 + i * 19);

  const dotY = y + h - 34, dotR = 7, dotSpacing = 22;
  const startX = cx - dotSpacing;
  for (let i = 0; i < 3; i++) {
    const dx = startX + i * dotSpacing;
    const filled = i < diff.dots;
    if (filled) {
      const gg = ctx.createRadialGradient(dx, dotY, 1, dx, dotY, dotR * 2);
      gg.addColorStop(0, `rgba(${diff.colorRGB},0.55)`);
      gg.addColorStop(1, `rgba(${diff.colorRGB},0)`);
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(dx, dotY, dotR * 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = filled ? diff.color : 'rgba(255,255,255,0.10)';
    ctx.beginPath(); ctx.arc(dx, dotY, dotR, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawOutfitCard(b, hovered) {
  const { x, y, w, h } = b;
  const outfit = OUTFITS[b.outfitKey];
  const owned = save.ownedOutfits.includes(b.outfitKey);
  const equipped = save.selectedOutfit === b.outfitKey;
  const canAfford = save.coins >= outfit.cost;

  ctx.save();
  if (equipped) { ctx.shadowColor = '#ffd24a'; ctx.shadowBlur = 26; }
  else if (hovered) { ctx.shadowColor = outfit.swatch1; ctx.shadowBlur = 22; }
  else { ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 14; }

  const bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, 'rgba(38,18,22,0.96)');
  bg.addColorStop(1, 'rgba(16,7,13,0.98)');
  ctx.fillStyle = bg; rrect(x, y, w, h, 14); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = equipped ? '#ffd24a' : (hovered ? outfit.swatch1 : 'rgba(255,210,90,0.35)');
  ctx.lineWidth = equipped ? 2.4 : (hovered ? 2.0 : 1.4);
  rrect(x, y, w, h, 14); ctx.stroke();

  if (equipped) {
    ctx.strokeStyle = 'rgba(255,210,90,0.4)';
    rrect(x + 4, y + 4, w - 8, h - 8, 10); ctx.stroke();
  }

  /* Character on the left */
  drawMiniCharacter(x + 45, y + h / 2 + 6, outfit, 1.15);

  /* Divider */
  ctx.strokeStyle = 'rgba(255,210,90,0.15)';
  ctx.beginPath();
  ctx.moveTo(x + 85, y + 14);
  ctx.lineTo(x + 85, y + h - 14);
  ctx.stroke();

  /* Name */
  ctx.fillStyle = '#ffd24a';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(outfit.name, x + 98, y + 24);

  /* Swatches */
  const swatchY = y + 50;
  const swatchGap = 22;
  ctx.fillStyle = outfit.swatch1;
  ctx.beginPath(); ctx.arc(x + 108, swatchY, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x + 108, swatchY, 7, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = outfit.swatch2;
  ctx.beginPath(); ctx.arc(x + 108 + swatchGap, swatchY, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 108 + swatchGap, swatchY, 7, 0, Math.PI * 2); ctx.stroke();

  /* Status pill */
  let statusText, statusColor, statusBg;
  if (equipped) {
    statusText = '✓ EQUIPPED'; statusColor = '#a8e6a0'; statusBg = 'rgba(60,120,60,0.35)';
  } else if (owned) {
    statusText = 'TAP TO EQUIP'; statusColor = '#7ee0ff'; statusBg = 'rgba(40,90,140,0.35)';
  } else if (canAfford) {
    statusText = 'BUY · ' + outfit.cost + ' 🪙'; statusColor = '#ffd24a'; statusBg = 'rgba(140,90,20,0.4)';
  } else {
    statusText = 'NEED ' + (outfit.cost - save.coins); statusColor = '#ff8a8a'; statusBg = 'rgba(140,40,40,0.35)';
  }

  ctx.font = 'bold 10.5px system-ui, sans-serif';
  const tw = ctx.measureText(statusText).width + 20;
  const statusY = y + h - 22;
  const statusX = x + 98;

  ctx.fillStyle = statusBg;
  rrect(statusX, statusY - 11, tw, 22, 11); ctx.fill();
  ctx.strokeStyle = statusColor; ctx.lineWidth = 1;
  rrect(statusX, statusY - 11, tw, 22, 11); ctx.stroke();

  ctx.fillStyle = statusColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(statusText, statusX + 10, statusY + 1);

  ctx.restore();
}