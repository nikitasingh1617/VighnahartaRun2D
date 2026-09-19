import { save, persistSave } from './core/save.js';

const CLOUD_URL = 'https://script.google.com/macros/s/AKfycbxDzLQ_c1kSgWa0xYIFOSoQDZIPGcNEXSUB803O3GBUHKKOBdhjo5FBX9i4rSCdXBaJ/exec';

const CACHE_KEY = 'vighanharta_cloud_cache';

let lastSync = 0;
let syncInFlight = false;

/* ------------------------------------------------------------
   JSONP fetch — bypasses CORS entirely
   ------------------------------------------------------------ */
function jsonpGet(url, timeoutMs = 10000) {
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
      reject(new Error('script error'));
    };

    const sep = url.indexOf('?') >= 0 ? '&' : '?';
    script.src = url + sep + 'callback=' + cbName + '&t=' + Date.now();
    document.head.appendChild(script);
  });
}

/* ------------------------------------------------------------
   Local cache
   ------------------------------------------------------------ */
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.board)) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

function writeCache(board) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      board,
      savedAt: Date.now()
    }));
  } catch (e) {}
}

export function getCachedBoard() {
  const c = readCache();
  return c ? c.board : null;
}

/* ------------------------------------------------------------
   Fetch leaderboard via JSONP
   ------------------------------------------------------------ */
export async function fetchLeaderboard() {
  try {
    const data = await jsonpGet(CLOUD_URL, 10000);
    if (!Array.isArray(data)) return null;

    const cleaned = data
      .filter(p => p && p.name)
      .map(p => ({
        name: String(p.name).trim(),
        bestScore: Number(p.bestScore) || 0,
        bestTime: Number(p.bestTime) || 0,
        bestRounds: Number(p.bestRounds) || 0,
        coinsHeld: Number(p.coinsHeld) || 0,
        lastScene: p.lastScene || 'night',
        lastDifficulty: p.lastDifficulty || 'medium',
        lastUpdated: p.lastUpdated || ''
      }))
      .filter(p => p.name.length > 0);

    writeCache(cleaned);
    return cleaned;
  } catch (e) {
    return null;
  }
}

/* ------------------------------------------------------------
   POST — use no-cors fire-and-forget
   ------------------------------------------------------------ */
export async function submitRun(run) {
  if (!save.playerName || save.playerName.trim().length < 1) return;
  if (syncInFlight) return;
  syncInFlight = true;

  const payload = {
    name: save.playerName.trim(),
    bestScore: Number(run.score) || 0,
    bestTime: Number(run.seconds) || 0,
    bestRounds: Number(run.roundsCompleted) || 0,
    coinsHeld: Number(save.coins) || 0,
    lastScene: run.scene || 'night',
    lastDifficulty: run.difficulty || 'medium',
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
   Load single player
   ------------------------------------------------------------ */
export async function loadPlayerFromCloud(name) {
  if (!name || name.trim().length < 1) return null;

  const cached = getCachedBoard();
  if (cached) {
    const hit = cached.find(p =>
      (p.name || '').trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (hit) {
      return {
        coinsHeld: hit.coinsHeld,
        bestScore: hit.bestScore,
        bestTime: hit.bestTime,
        bestRounds: hit.bestRounds
      };
    }
  }

  try {
    const data = await jsonpGet(CLOUD_URL, 10000);
    if (!Array.isArray(data)) return null;
    const me = data.find(p =>
      (p.name || '').trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (!me) return null;
    return {
      coinsHeld: Number(me.coinsHeld) || 0,
      bestScore: Number(me.bestScore) || 0,
      bestTime: Number(me.bestTime) || 0,
      bestRounds: Number(me.bestRounds) || 0
    };
  } catch (e) {
    return null;
  }
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

export function mergeLeaderboards(localBoard, cloudBoard) {
  const cloud = cloudBoard || [];
  if (cloud.length === 0 && (!localBoard || localBoard.length === 0)) return [];

  const merged = new Map();

  for (const e of (localBoard || [])) {
    merged.set(e.name, { ...e });
  }

  for (const p of cloud) {
    const existing = merged.get(p.name);
    if (!existing || p.bestScore >= (existing.score || 0)) {
      merged.set(p.name, {
        name: p.name,
        score: p.bestScore,
        seconds: p.bestTime,
        roundsCompleted: p.bestRounds,
        coinsHeld: p.coinsHeld,
        scene: p.lastScene,
        difficulty: p.lastDifficulty,
        date: (p.lastUpdated || '').slice(0, 10)
      });
    } else if (existing) {
      existing.coinsHeld = p.coinsHeld;
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 20);
}