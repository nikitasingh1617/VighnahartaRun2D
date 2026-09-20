import './core/canvas.js';
import './gameplay/rounds.js';
import { installInput } from './core/input.js';
import { startLoop } from './core/loop.js';
import { save } from './core/save.js';
import { fetchLeaderboard } from './cloud.js';

window.__save = save;

/* Kill any stale service worker from earlier tests */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => { try { r.unregister(); } catch (e) {} });
  }).catch(() => {});
}

/* Prefetch the leaderboard at boot so it's ready when the user opens it */
setTimeout(() => {
  fetchLeaderboard().catch(() => {});
}, 500);

installInput();
startLoop();