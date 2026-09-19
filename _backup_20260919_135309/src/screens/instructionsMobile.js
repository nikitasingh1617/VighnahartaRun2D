import { ctx, W, H } from '../core/canvas.js';
import { state } from '../core/state.js';
import { drawMenuBackground } from './_background.js';
import { drawButtons } from '../ui/buttons.js';
import { rrect } from '../util/drawing.js';

const CANDIDATES = [
  'assets/instructions-mobile.png',
  'assets/instructions-mobile.jpg',
  'assets/instructions-mobile.jpeg',
  'assets/instructions.png',
  'assets/instructions.jpg',
];

const img = new Image();
let imgReady = false;
let imgFailed = false;

(function tryLoad(i) {
  if (i >= CANDIDATES.length) { imgFailed = true; return; }
  img.onload  = () => { imgReady = true; };
  img.onerror = () => tryLoad(i + 1);
  img.src = CANDIDATES[i];
})(0);

/* -------------------------------------------------------------
   Shared renderer for both modes.
   `isIntro` adds the "read first" hint + countdown label.
   ------------------------------------------------------------- */
function drawMobileInstructions(isIntro) {
  drawMenuBackground();

  /* Top banner */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = 'rgba(255,210,120,0.85)';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.fillText(
    isIntro
      ? '✦    R E A D   F I R S T    ✦'
      : '✦    H O W   T O   P L A Y    ✦',
    W / 2, 18
  );

  const tg = ctx.createLinearGradient(0, 30, 0, 64);
  tg.addColorStop(0, '#fff6d0');
  tg.addColorStop(0.5, '#ffd24a');
  tg.addColorStop(1, '#e8a020');
  ctx.fillStyle = tg;
  ctx.shadowColor = 'rgba(255,150,40,0.55)';
  ctx.shadowBlur = 16;
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText('HOW TO PLAY', W / 2, 46);
  ctx.shadowBlur = 0;
  ctx.restore();

  /* Image frame */
  const boxW = 900, boxH = 396;
  const boxX = (W - boxW) / 2, boxY = 66;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 26;
  ctx.fillStyle = 'rgba(20, 8, 14, 0.92)';
  rrect(boxX, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,200,90,0.9)';
  ctx.lineWidth = 2.4;
  rrect(boxX, boxY, boxW, boxH, 16);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,200,90,0.3)';
  ctx.lineWidth = 1;
  rrect(boxX + 6, boxY + 6, boxW - 12, boxH - 12, 12);
  ctx.stroke();

  /* Image content */
  if (imgReady) {
    const pad = 14;
    const availW = boxW - pad * 2;
    const availH = boxH - pad * 2;
    const s = Math.min(availW / img.width, availH / img.height);
    const dw = img.width * s;
    const dh = img.height * s;
    const dx = boxX + (boxW - dw) / 2;
    const dy = boxY + (boxH - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    /* Placeholder until the user drops their image in */
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,210,74,0.85)';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText('INSTRUCTIONS IMAGE', W / 2, boxY + boxH / 2 - 26);
    ctx.fillStyle = 'rgba(255,235,200,0.65)';
    ctx.font = 'italic 14px Georgia, serif';
    ctx.fillText('Drop your image at:', W / 2, boxY + boxH / 2 + 6);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('assets/instructions-mobile.png', W / 2, boxY + boxH / 2 + 32);
    ctx.restore();
  }

  /* If intro mode, show a small countdown reminder under the button row */
  if (isIntro && state.introT < 3) {
    const remaining = Math.max(1, Math.ceil(3 - state.introT));
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,210,120,0.75)';
    ctx.font = 'italic 11px Georgia, serif';
    ctx.fillText('reading time… ' + remaining, W / 2, H - 8);
    ctx.restore();
  }

  drawButtons();
}

export function drawInstructionsMobileScreen() {
  drawMobileInstructions(false);
}

export function drawIntroMobileScreen() {
  drawMobileInstructions(true);
}