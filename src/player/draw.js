import { ctx } from '../core/canvas.js';
import { camera, state, player } from '../core/state.js';
import { GROUND_Y } from '../core/config.js';
import { OUTFITS } from '../data/outfits.js';
import { save } from '../core/save.js';
import { drawModak } from '../world/props.js';

function outfit() {
  return OUTFITS[save.selectedOutfit] || OUTFITS.classic;
}

export function drawMiniCharacter(cx, cy, o, scale) {
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(scale, scale);
  ctx.strokeStyle = o.skin; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(-6, 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4, -4); ctx.lineTo(6, 12); ctx.stroke();
  ctx.fillStyle = '#3a2a1a';
  ctx.beginPath(); ctx.ellipse(-6, 13, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(6, 13, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  const kg = ctx.createLinearGradient(0, -30, 0, -2);
  kg.addColorStop(0, o.kurtaTop); kg.addColorStop(1, o.kurtaBot);
  ctx.fillStyle = kg;
  ctx.beginPath();
  ctx.moveTo(-8, -30); ctx.lineTo(8, -30); ctx.lineTo(11, -2); ctx.lineTo(-11, -2);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = o.kurtaHem; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-11, -2); ctx.lineTo(11, -2); ctx.stroke();
  ctx.fillStyle = o.skinLight;
  ctx.beginPath(); ctx.arc(0, -40, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = o.hair;
  ctx.beginPath(); ctx.arc(0, -41, 9, Math.PI * 1.02, Math.PI * 2.02); ctx.fill();
  ctx.fillStyle = '#241a15';
  ctx.beginPath(); ctx.arc(-3, -40, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3, -40, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = o.tilak;
  ctx.fillRect(-0.7, -48, 1.4, 4);
  ctx.restore();
}

export function drawPlayer() {
  const p = player;
  if (p.pooja) { drawPlayerPooja(p.x, p.y); return; }
  const o = outfit();
  const x = p.x, y = p.y;
  const sc = p.onGround ? 1 : 0.62;
  ctx.globalAlpha = p.onGround ? 0.42 : 0.18;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(x, GROUND_Y + 3, 20 * sc, 6 * sc, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(p.facing, 1);
  if (p.crouching) ctx.scale(1, 0.55);
  const swing = p.moving ? Math.sin(p.animT) : 0;
  const bob = p.moving ? Math.abs(Math.sin(p.animT)) * 2.2 : Math.sin(camera.time * 2) * 1.2;
  ctx.translate(0, -bob);
  const inAir = !p.onGround;
  const aarti = p.aarti;

  ctx.strokeStyle = o.skin; ctx.lineWidth = 7; ctx.lineCap = 'round';
  let l1x, l1y, l2x, l2y;
  if (inAir)                      { l1x = -9; l1y = -4; l2x = 10; l2y = -8; }
  else if (p.crouching || aarti)  { l1x = -8; l1y = -1; l2x = 8; l2y = -1; }
  else                            { l1x = -5 + swing * 7; l1y = -1; l2x = 5 - swing * 7; l2y = -1; }
  ctx.beginPath(); ctx.moveTo(-5, -26); ctx.lineTo(l1x, l1y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, -26); ctx.lineTo(l2x, l2y); ctx.stroke();
  ctx.fillStyle = '#3a2a1a';
  ctx.beginPath(); ctx.ellipse(l1x, l1y + 1, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(l2x, l2y + 1, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill();

  const kg = ctx.createLinearGradient(0, -62, 0, -24);
  kg.addColorStop(0, o.kurtaTop); kg.addColorStop(1, o.kurtaBot);
  ctx.fillStyle = kg;
  ctx.beginPath();
  ctx.moveTo(-10, -62); ctx.lineTo(10, -62); ctx.lineTo(14, -24); ctx.lineTo(-14, -24);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = o.kurtaShade;
  ctx.beginPath();
  ctx.moveTo(3, -62); ctx.lineTo(10, -62); ctx.lineTo(14, -24); ctx.lineTo(6, -24);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = o.kurtaHem; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-14, -24); ctx.lineTo(14, -24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, -62); ctx.lineTo(10, -62); ctx.stroke();

  ctx.strokeStyle = o.skin; ctx.lineWidth = 6;
  if (aarti) {
    ctx.beginPath(); ctx.moveTo(-9, -58); ctx.lineTo(-1, -50); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9, -58); ctx.lineTo(1, -50); ctx.stroke();
  } else if (p.crouching) {
    ctx.beginPath(); ctx.moveTo(-9, -58); ctx.lineTo(-2, -46); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9, -58); ctx.lineTo(2, -46); ctx.stroke();
  } else {
    const a1 = inAir ? -0.9 : swing * 0.55;
    const a2 = inAir ? -0.9 : -swing * 0.55;
    ctx.beginPath();
    ctx.moveTo(-9, -58);
    ctx.lineTo(-9 + Math.sin(a1) * 16, -58 + Math.cos(a1) * 16); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(9, -58);
    ctx.lineTo(9 + Math.sin(a2) * 16, -58 + Math.cos(a2) * 16); ctx.stroke();
  }

  if (p.holding) {
    const mx = aarti ? 0 : 5;
    const my = aarti ? -56 : -52;
    drawModak(mx, my, 1, 0);
    ctx.fillStyle = o.skin;
    ctx.beginPath(); ctx.arc(mx - 3, my + 3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(mx + 3, my + 3, 3, 0, Math.PI * 2); ctx.fill();
  }

  ctx.fillStyle = o.skin;
  ctx.fillRect(-3, -67, 6, 6);
  ctx.fillStyle = o.skinLight;
  ctx.beginPath(); ctx.arc(0, -77, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = o.hair;
  ctx.beginPath(); ctx.arc(0, -79, 13, Math.PI * 1.02, Math.PI * 2.02); ctx.fill();
  ctx.beginPath(); ctx.arc(-2, -89, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#241a15';
  ctx.beginPath(); ctx.arc(-4, -77, 1.7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -77, 1.7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#a06040'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(1, -72, 3, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.fillStyle = o.tilak;
  ctx.fillRect(-1, -88, 2, 5);
  ctx.fillStyle = 'rgba(230,120,120,0.35)';
  ctx.beginPath(); ctx.arc(-8, -73, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(9, -73, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawPlayerPooja(x, y) {
  const o = outfit();
  const t = state.winT;
  const bob = Math.sin(t * 2) * 1.2;
  const bow = Math.min(1, t / 1.2) * 4;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = 0.4; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(0, 3, 24, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.translate(0, bob + bow);
  ctx.fillStyle = o.skin;
  ctx.beginPath(); ctx.ellipse(-10, -8, 12, 7, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10, -8, 12, 7, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a2a1a';
  ctx.beginPath(); ctx.ellipse(-14, -3, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(14, -3, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
  const kg = ctx.createLinearGradient(0, -58, 0, -12);
  kg.addColorStop(0, o.kurtaTop); kg.addColorStop(1, o.kurtaBot);
  ctx.fillStyle = kg;
  ctx.beginPath();
  ctx.moveTo(-11, -58); ctx.lineTo(11, -58); ctx.lineTo(14, -12); ctx.lineTo(-14, -12);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = o.kurtaShade;
  ctx.beginPath();
  ctx.moveTo(3, -58); ctx.lineTo(11, -58); ctx.lineTo(14, -12); ctx.lineTo(6, -12);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = o.kurtaHem; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-14, -12); ctx.lineTo(14, -12); ctx.stroke();
  ctx.strokeStyle = o.skin; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-9, -54); ctx.quadraticCurveTo(-4, -44, 0, -40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(9, -54); ctx.quadraticCurveTo(4, -44, 0, -40); ctx.stroke();
  ctx.fillStyle = o.skinLight;
  ctx.beginPath(); ctx.ellipse(0, -40, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = o.skin;
  ctx.fillRect(-3, -63, 6, 6);
  ctx.fillStyle = o.skinLight;
  ctx.beginPath(); ctx.arc(0, -73, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = o.hair;
  ctx.beginPath(); ctx.arc(0, -75, 13, Math.PI * 1.02, Math.PI * 2.02); ctx.fill();
  ctx.beginPath(); ctx.arc(-2, -85, 5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#241a15'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(-4, -73, 2.6, 0.15, Math.PI - 0.15); ctx.stroke();
  ctx.beginPath(); ctx.arc(5, -73, 2.6, 0.15, Math.PI - 0.15); ctx.stroke();
  ctx.strokeStyle = '#a06040'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(1, -68, 3, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.fillStyle = o.tilak;
  ctx.fillRect(-1, -84, 2, 5);
  ctx.fillStyle = 'rgba(230,120,120,0.35)';
  ctx.beginPath(); ctx.arc(-8, -69, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(9, -69, 3, 0, Math.PI * 2); ctx.fill();

  if (t > 0.5) {
    const aura = Math.min(1, (t - 0.5) / 1.5);
    const r = 55 + Math.sin(t * 2.5) * 5;
    const ag = ctx.createRadialGradient(0, -55, 5, 0, -55, r);
    ag.addColorStop(0, `rgba(255,225,140,${0.35 * aura})`);
    ag.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(0, -55, r, 0, Math.PI * 2); ctx.fill();
  }

  const thaliX = 0, thaliY = -18;
  ctx.fillStyle = '#c9a961';
  ctx.beginPath(); ctx.ellipse(thaliX, thaliY, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e0be74';
  ctx.beginPath(); ctx.ellipse(thaliX, thaliY - 1, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(thaliX, thaliY - 3);
  const flick = 0.85 + Math.sin(t * 14) * 0.2;
  const dg = ctx.createRadialGradient(0, -6, 1, 0, -6, 24);
  dg.addColorStop(0, 'rgba(255,200,90,0.9)');
  dg.addColorStop(1, 'rgba(255,160,60,0)');
  ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(0, -6, 24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a85a1c';
  ctx.beginPath(); ctx.moveTo(-7, 0); ctx.quadraticCurveTo(0, 10, 7, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd24a';
  ctx.beginPath(); ctx.ellipse(0, -5 * flick, 2.6, 6 * flick, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff8cc';
  ctx.beginPath(); ctx.ellipse(0, -4 * flick, 1.2, 3 * flick, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + t * 0.3;
    const fx = thaliX + Math.cos(a) * 16;
    const fy = thaliY - 2 + Math.sin(a) * 5;
    ctx.fillStyle = ['#ff8c1a','#ffb84d','#ff5b5b','#ffd24a'][i];
    ctx.beginPath(); ctx.arc(fx, fy, 2.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}