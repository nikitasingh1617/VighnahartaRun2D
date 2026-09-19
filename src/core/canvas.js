export const cvs = document.getElementById('c');
export const ctx = cvs.getContext('2d');
export const W = 960, H = 540;
cvs.width = W; cvs.height = H;

export function resize() {
  const s = Math.min(window.innerWidth / W, window.innerHeight / H);
  cvs.style.width  = (W * s) + 'px';
  cvs.style.height = (H * s) + 'px';
}
window.addEventListener('resize', resize);
resize();