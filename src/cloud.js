import { save, persistSave } from './core/save.js';

const CLOUD_URL = 'https://script.google.com/macros/s/AKfycbxDzLQ_c1kSgWa0xYIFOSoQDZIPGcNEXSUB803O3GBUHKKOBdhjo5FBX9i4rSCdXBaJ/exec';

const CACHE_KEY = 'vighanharta_cloud_cache';

let lastSync = 0;
let syncInFlight = false;

/* ------------------------------------------------------------
   JSONP with retry
   ------------------------------------------------------------ */
function jsonpAttempt(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const cbName = '__vh_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    let done = false;

    const script = document.createElement('script');
    const timeoutId = setTimeout(() => {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error('timeout'));
    }, timeoutMs);

    function cleanup() {
      try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
      if (script.parentNode) script.parentNode.removeChild(script);
      clearTimeout(timeoutId);
    }

    window[cbName] = function (data) {
      if (done) return;
      done = true;
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error('script_error'));
    };

    const sep = url.indexOf('?') >= 0 ? '&' : '?';
    script.src = url + sep + 'callback=' + cbName + '&_=' + Date.now();
    document.head.appendChild(script);
  });
}

async function jsonpGet(url, timeoutMs = 20000, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await jsonpAttempt(url, timeoutMs);
    } catch (e) {
      console.warn('[cloud] JSONP attempt ' + (i + 1) + ' failed:', e.message);
      if (i === retries) return null;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  return null;
}

/* ------------------------------------------------------------
   Cache
   ------------------------------------------------------------ */
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.board)) return null;
    return parsed;
  } catch (e) { return null; }
}

function writeCache(board) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ board, savedAt: Date.now() }));
  } catch (e) {}
}

export function getCachedBoard() {
  const c = readCache();
  return c ? c.board : null;
}

/* ------------------------------------------------------------
   Fetch leaderboard (returns raw rows)
   ------------------------------------------------------------ */
export async function fetchLeaderboard() {
  console.log('[cloud] fetching leaderboard…');
  const data = await jsonpGet(CLOUD_URL, 20000, 2);

  if (!Array.isArray(data)) {
    console.warn('[cloud] no valid data');
    return null;
  }

  const cleaned = data
    .filter(p => p && p.name)
    .map(p => ({
      name: String(p.name).trim(),
      difficulty: String(p.difficulty || 'medium').toLowerCase(),
      rounds: Number(p.rounds) || 0,
      time: Number(p.time) || 0,
      coinsHeld: Number(p.coinsHeld) || 0,
      lastUpdated: p.lastUpdated || ''
    }))
    .filter(p => p.name.length > 0 && p.rounds >= 1);

  console.log('[cloud] got ' + cleaned.length + ' rows');
  writeCache(cleaned);
  return cleaned;
}

/* ------------------------------------------------------------
   Submit a run
   ------------------------------------------------------------ */
export async function submitRun(run) {
  if (!save.playerName || save.playerName.trim().length < 1) return;
  if (syncInFlight) return;
  syncInFlight = true;

  const payload = {
    name: save.playerName.trim(),
    difficulty: save.difficulty || 'medium',
    rounds: Number(run.rounds) || 0,
    time: Number(run.time) || 0,
    coinsHeld: Number(save.coins) || 0,
    lastUpdated: new Date().toISOString()
  };

  try {
    await fetch(CLOUD_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    lastSync = Date.now();
  } catch (e) {
    /* fire and forget */
  } finally {
    syncInFlight = false;
  }
}

export async function syncWallet() {
  if (!save.playerName || save.playerName.trim().length < 1) return;
  if (syncInFlight) return;
  if (Date.now() - lastSync < 2000) return;

  syncInFlight = true;
  try {
    await fetch(CLOUD_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        name: save.playerName.trim(),
        coinsHeld: Number(save.coins) || 0,
        lastUpdated: new Date().toISOString()
      })
    });
    lastSync = Date.now();
  } catch (e) {
    /* ignore */
  } finally {
    syncInFlight = false;
  }
}

/* ------------------------------------------------------------
   Load single player wallet
   ------------------------------------------------------------ */
export async function loadPlayerFromCloud(name) {
  if (!name || name.trim().length < 1) return null;

  const cached = getCachedBoard();
  if (cached) {
    const hit = cached.find(p =>
      (p.name || '').trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (hit) {
      return { coinsHeld: hit.coinsHeld };
    }
  }

  const data = await jsonpGet(CLOUD_URL, 20000, 1);
  if (!Array.isArray(data)) return null;
  const me = data.find(p =>
    (p.name || '').trim().toLowerCase() === name.trim().toLowerCase()
  );
  if (!me) return null;
  return { coinsHeld: Number(me.coinsHeld) || 0 };
}

export function startGameWithCloudSync() {
  requestAnimationFrame(() => {
    import('./gameplay/rounds.js').then(m => m.startRound(1));
  });

  loadPlayerFromCloud(save.playerName).then(cloud => {
    if (!cloud) return;
    if (cloud.coinsHeld > save.coins) {
      save.coins = cloud.coinsHeld;
      persistSave();
    }
  });
}