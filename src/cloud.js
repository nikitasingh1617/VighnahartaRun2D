import { save } from './core/save.js';

const CLOUD_URL = 'https://script.google.com/macros/s/AKfycbxDzLQ_c1kSgWa0xYIFOSoQDZIPGcNEXSUB803O3GBUHKKOBdhjo5FBX9i4rSCdXBaJ/exec';

let lastSync = 0;
let syncInFlight = false;

export async function fetchLeaderboard() {
  try {
    const res = await fetch(CLOUD_URL, { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    return data
      .filter(p => p.name)
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
  } catch (e) {
    return null;
  }
}

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
      body: JSON.stringify(payload)
    });
    lastSync = Date.now();
  } catch (e) {
    /* Offline — ignore */
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
      body: JSON.stringify({
        name: save.playerName.trim(),
        coinsHeld: Number(save.coins) || 0,
        lastUpdated: new Date().toISOString()
      })
    });
    lastSync = Date.now();
  } catch (e) {
    /* Ignore */
  } finally {
    syncInFlight = false;
  }
}

export function mergeLeaderboards(localBoard, cloudBoard) {
  if (!cloudBoard || cloudBoard.length === 0) return localBoard;

  const merged = new Map();

  for (const e of localBoard) {
    merged.set(e.name, { ...e });
  }

  for (const p of cloudBoard) {
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
      /* Keep local best score, but trust cloud for wallet */
      existing.coinsHeld = p.coinsHeld;
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 20);
}