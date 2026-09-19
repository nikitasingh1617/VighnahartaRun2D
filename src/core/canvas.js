export const cvs = document.getElementById('c');
export const ctx = cvs.getContext('2d');
export const W = 960, H = 540;

/* Cap DPR at 2 — beyond that it's diminishing returns and hurts perf on mid-range phones */
const MAX_DPR = 2;

export function resize() {
  const s = Math.min(window.innerWidth / W, window.innerHeight / H);
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

  const displayW = W * s;
  const displayH = H * s;

  cvs.style.width  = displayW + 'px';
  cvs.style.height = displayH + 'px';

  /* Internal resolution = actual pixels on screen */
  cvs.width  = Math.round(displayW * dpr);
  cvs.height = Math.round(displayH * dpr);
}

window.addEventListener('resize', resize);
resize();