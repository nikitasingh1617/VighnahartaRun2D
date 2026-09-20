export const cvs = document.getElementById('c');
export const ctx = cvs.getContext('2d');
export const W = 960, H = 540;

/* Allow up to 3x so phones with DPR 2.6-3.5 render at (near) native resolution.
   MAX_PIXELS is a safety budget so huge 4K screens don't tank the frame rate. */
const MAX_DPR = 3;
const MAX_PIXELS = 3840 * 2160;

export function resize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const s = Math.min(vw / W, vh / H);
  let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

  /* Backing store = whole device pixels (no fractional rounding) */
  let bw = Math.floor(W * s * dpr);
  let bh = Math.round(bw * H / W);

  /* Pixel budget guard */
  if (bw * bh > MAX_PIXELS) {
    const k = Math.sqrt(MAX_PIXELS / (bw * bh));
    bw = Math.floor(bw * k);
    bh = Math.round(bw * H / W);
  }

  cvs.width  = bw;
  cvs.height = bh;

  /* CSS size derived FROM the backing store, so the browser never has to
     resample the canvas (resampling is what makes everything look soft). */
  cvs.style.width  = (bw / dpr) + 'px';
  cvs.style.height = (bh / dpr) + 'px';

  /* Setting width/height resets the context, so (re)apply quality hints */
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}

window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 150));
document.addEventListener('fullscreenchange', () => setTimeout(resize, 100));
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
resize();