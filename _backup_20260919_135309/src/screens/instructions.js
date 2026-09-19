import { ctx, W } from '../core/canvas.js';
import { drawMenuBackground } from './_background.js';
import { drawButtons } from '../ui/buttons.js';
import {
  drawOrnateLine, drawCornerFlourish, drawOmCartouche, rrect
} from '../util/drawing.js';

export function drawInstructionsScreen() {
  drawMenuBackground();
  drawInstructionsPanel();
  drawButtons();
}

export function drawInstructionsPanel() {
  const cx0 = 50, cy0 = 50, cw = W - 100, ch = 400;

  /* Card body */
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 12;
  const bg = ctx.createLinearGradient(0, cy0, 0, cy0 + ch);
  bg.addColorStop(0, 'rgba(58,22,14,0.98)');
  bg.addColorStop(0.5, 'rgba(34,12,10,0.98)');
  bg.addColorStop(1, 'rgba(20,6,8,0.99)');
  ctx.fillStyle = bg; rrect(cx0, cy0, cw, ch, 22); ctx.fill();
  ctx.restore();

  /* Gold borders */
  ctx.strokeStyle = 'rgba(255,200,90,1)'; ctx.lineWidth = 2.4;
  rrect(cx0, cy0, cw, ch, 22); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,200,90,0.42)'; ctx.lineWidth = 1;
  rrect(cx0 + 8, cy0 + 8, cw - 16, ch - 16, 16); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,200,90,0.16)';
  rrect(cx0 + 14, cy0 + 14, cw - 28, ch - 28, 12); ctx.stroke();

  drawCornerFlourish(cx0 + 22, cy0 + 22, 1, 1);
  drawCornerFlourish(cx0 + cw - 22, cy0 + 22, -1, 1);
  drawCornerFlourish(cx0 + 22, cy0 + ch - 22, 1, -1);
  drawCornerFlourish(cx0 + cw - 22, cy0 + ch - 22, -1, -1);

  /* Om cartouche — inside the panel top edge so it isn't clipped */
  drawOmCartouche(W/2, cy0);

  /* Header */
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

  ctx.fillStyle = 'rgba(255,210,120,0.82)';
  ctx.font = 'bold 10px Georgia, serif';
  ctx.fillText('✦    G A N E S H   C H A T U R T H I   S P E C I A L    ✦', W/2, cy0 + 26);

  const tg = ctx.createLinearGradient(0, cy0 + 38, 0, cy0 + 76);
  tg.addColorStop(0, '#fff6d0'); tg.addColorStop(0.5, '#ffd24a'); tg.addColorStop(1, '#e8a020');
  ctx.fillStyle = tg;
  ctx.shadowColor = 'rgba(255,150,40,0.55)'; ctx.shadowBlur = 18;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('HOW TO PLAY', W/2, cy0 + 50);
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255,220,150,0.82)';
  ctx.font = 'italic 11px Georgia, serif';
  ctx.fillText('❀   A  S M A L L   R U N   F O R   A   B I G   B L E S S I N G   ❀', W/2, cy0 + 74);
  ctx.restore();

  drawOrnateLine(W/2, cy0 + 88, 380, 'rgba(255,210,74,0.4)');

  /* ---- Content ---- */
  const contentTop = cy0 + 98;              // = 148
  const colW = 250;
  const colGap = 25;
  const totalW = colW * 3 + colGap * 2;
  const startX = W/2 - totalW / 2;

  const secH = 130;
  const secGap = 10;

  drawSection(startX,                     contentTop, colW, secH, '🎯', 'YOUR GOAL', '168,230,160', [
    'Carry 5 modaks to Bappa\u2019s',
    'pandal — one at a time.',
    '',
    'Pick up at the plate.',
    'Offer at the pandal.',
    'Return for the next.'
  ]);

  drawSection(startX + colW + colGap,     contentTop, colW, secH, '🔔', 'THE AARTI RULE', '255,120,120', [
    'When the light turns RED and',
    'the bell rings:',
    '',
    'HOLD [ALT] — stay frozen.',
    'Move or release ALT —',
    'all modaks lost.'
  ]);

  drawSection(startX + (colW + colGap)*2, contentTop, colW, secH, '🔥', 'PROGRESSION', '255,210,74', [
    '3 scenes · 3 difficulties.',
    '5 rounds each.',
    '',
    'Finish a scene to unlock',
    'the next. Faster runs',
    'earn more points & coins.'
  ]);

  const ctrlY = contentTop + secH + secGap;
  const ctrlH = 130;
  drawControlsBlock(cx0, cw, ctrlY, ctrlH);
}

function drawSection(x, y, w, h, iconChar, title, accent, lines) {
  const bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, `rgba(${accent},0.06)`);
  bg.addColorStop(1, `rgba(${accent},0.015)`);
  ctx.fillStyle = bg; rrect(x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = `rgba(${accent},0.24)`; ctx.lineWidth = 1;
  rrect(x, y, w, h, 12); ctx.stroke();

  /* Header row */
  const ix = x + 24, iy = y + 22, ir = 13;
  const gl = ctx.createRadialGradient(ix, iy, 2, ix, iy, ir * 1.8);
  gl.addColorStop(0, `rgba(${accent},0.38)`);
  gl.addColorStop(1, `rgba(${accent},0)`);
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.arc(ix, iy, ir * 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(${accent},0.24)`;
  ctx.beginPath(); ctx.arc(ix, iy, ir, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `rgba(${accent},0.9)`; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(ix, iy, ir, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff8e8';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(iconChar, ix, iy + 1);

  ctx.fillStyle = `rgb(${accent})`;
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, ix + ir + 10, iy);

  ctx.strokeStyle = `rgba(${accent},0.30)`; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 18, y + 42);
  ctx.lineTo(x + w - 18, y + 42);
  ctx.stroke();

  /* Body — 6 lines max, 12px line height → 72px tall, fits in 130px box */
  ctx.fillStyle = 'rgba(255,240,215,0.9)';
  ctx.font = '11.5px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x + 18, y + 58 + i * 12);
  }
}

function drawControlsBlock(cx0, cw, ctrlY, ctrlH) {
  const x = cx0 + 22;
  const w = cw - 44;

  const cbBg = ctx.createLinearGradient(0, ctrlY, 0, ctrlY + ctrlH);
  cbBg.addColorStop(0, 'rgba(126,224,255,0.06)');
  cbBg.addColorStop(1, 'rgba(126,224,255,0.012)');
  ctx.fillStyle = cbBg;
  rrect(x, ctrlY, w, ctrlH, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(126,224,255,0.25)'; ctx.lineWidth = 1;
  rrect(x, ctrlY, w, ctrlH, 12); ctx.stroke();

  /* Header */
  const cix = x + 24, ciy = ctrlY + 22, cir = 13;
  const cgl = ctx.createRadialGradient(cix, ciy, 2, cix, ciy, cir * 1.8);
  cgl.addColorStop(0, 'rgba(126,224,255,0.38)');
  cgl.addColorStop(1, 'rgba(126,224,255,0)');
  ctx.fillStyle = cgl;
  ctx.beginPath(); ctx.arc(cix, ciy, cir * 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(126,224,255,0.24)';
  ctx.beginPath(); ctx.arc(cix, ciy, cir, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(126,224,255,0.9)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cix, ciy, cir, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff8e8';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('⌨', cix, ciy + 1);

  ctx.fillStyle = 'rgb(126,224,255)';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('CONTROLS', cix + cir + 10, ciy);

  ctx.strokeStyle = 'rgba(126,224,255,0.28)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 18, ctrlY + 42);
  ctx.lineTo(x + w - 18, ctrlY + 42);
  ctx.stroke();

  /* Two columns of key rows */
  const colGapInner = 40;
  const colInnerW = (w - 36 - colGapInner) / 2;
  const cLeftX  = x + 18;
  const cRightX = cLeftX + colInnerW + colGapInner;

  const leftRows = [
    { keys: ['A', '←'],          desc: 'run left' },
    { keys: ['D', '→'],          desc: 'run right' },
    { keys: ['W', '↑', 'SPACE'], desc: 'jump over obstacles' },
    { keys: ['S', '↓'],          desc: 'crouch under flyers' }
  ];
  const rightRows = [
    { keys: ['ALT'],      desc: 'hold for AARTI pose' },
    { keys: ['E'],        desc: 'pick up / offer modak' },
    { keys: ['ESC', 'P'], desc: 'pause / resume' }
  ];

  const rowY0 = ctrlY + 60;
  const rowH = 18;

  drawControlRows(cLeftX,  rowY0, rowH, leftRows);
  drawControlRows(cRightX, rowY0, rowH, rightRows);
}

function drawControlRows(x, y0, rowH, rows) {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const yy = y0 + r * rowH;
    let kx = x;

    for (const k of row.keys) {
      ctx.font = 'bold 9.5px system-ui, sans-serif';
      const kw = Math.max(22, ctx.measureText(k).width + 14);

      const bgK = ctx.createLinearGradient(0, yy - 8, 0, yy + 8);
      bgK.addColorStop(0, 'rgba(70,30,20,1)');
      bgK.addColorStop(1, 'rgba(30,10,8,1)');
      ctx.fillStyle = bgK;
      rrect(kx, yy - 8, kw, 16, 4); ctx.fill();
      ctx.strokeStyle = 'rgba(255,210,90,0.72)'; ctx.lineWidth = 1;
      rrect(kx, yy - 8, kw, 16, 4); ctx.stroke();

      ctx.fillStyle = '#ffd24a';
      ctx.font = 'bold 9.5px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(k, kx + kw / 2, yy + 1);

      kx += kw + 4;
    }

    ctx.fillStyle = 'rgba(255,240,215,0.88)';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(row.desc, x + 170, yy + 1);
  }
}