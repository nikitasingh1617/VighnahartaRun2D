import { ctx, W, H } from '../core/canvas.js';
import { camera } from '../core/state.js';

const menuBg = new Image();
let menuBgReady = false;

const CANDIDATES = [
  'assets/menu-bg.png',
  'assets/menu-bg.jpg',
  'assets/menu-bg.jpeg',
  'assets/menu_bg.jpg'
];

(function tryLoad(i) {
  if (i >= CANDIDATES.length) return;
  menuBg.onload  = () => { menuBgReady = true; };
  menuBg.onerror = () => tryLoad(i + 1);
  menuBg.src = CANDIDATES[i];
})(0);

export function drawMenuBackground() {
  if (menuBgReady) {
    const imgA = menuBg.width / menuBg.height;
    const cvA = W / H;
    let dx, dy, dw, dh;
    if (imgA > cvA) { dh = H; dw = H * imgA; dx = (W - dw) / 2; dy = 0; }
    else { dw = W; dh = W / imgA; dx = 0; dy = (H - dh) / 2; }
    ctx.drawImage(menuBg, dx, dy, dw, dh);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0a0624');
    g.addColorStop(0.35, '#231046');
    g.addColorStop(0.65, '#4a1a44');
    g.addColorStop(0.85, '#7a2a3a');
    g.addColorStop(1, '#2a0a1a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) {
      const sx = (i * 137) % W, sy = (i * 83) % 280;
      const a = 0.25 + 0.6 * Math.sin(camera.time * 1.4 + i);
      ctx.globalAlpha = a; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(sx, sy, 0.8 + (i % 3) * 0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  const ov = ctx.createLinearGradient(0, 0, 0, H);
  ov.addColorStop(0, 'rgba(6,2,14,0.62)');
  ov.addColorStop(0.30, 'rgba(6,2,14,0.30)');
  ov.addColorStop(0.55, 'rgba(6,2,14,0.44)');
  ov.addColorStop(1, 'rgba(6,2,14,0.86)');
  ctx.fillStyle = ov; ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.68)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}