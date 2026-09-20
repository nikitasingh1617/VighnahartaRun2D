import { W, H } from '../core/canvas.js';
import { state, keys } from '../core/state.js';
import { save, persistSave } from '../core/save.js';
import { SCENE_ORDER, SCENES } from '../data/scenes.js';
import { OUTFITS } from '../data/outfits.js';
import { initAudio, playCoin, playClick, playSceneUnlock, playRoundStart, toggleMute } from '../core/audio.js';
import { syncWallet, startGameWithCloudSync, loadPlayerFromCloud } from '../cloud.js';
import { enterLeaderboard, refreshLeaderboard } from '../screens/leaderboard.js';
import { enterUserPage, refreshUserData } from '../screens/user.js';
import { TUTORIAL_PAGES } from '../core/config.js';

/* Mute button dimensions */
const MUTE_W = 36;
const MUTE_H = 36;

function getMutePosition() {
  if (state.mode === 'menu' ||
      state.mode === 'sceneSelect' ||
      state.mode === 'diffSelect' ||
      state.mode === 'leaderboard' ||
      state.mode === 'user' ||
      state.mode === 'shop') {
    return { x: W - 200, y: 22 };
  }
  if (state.mode === 'playing' || state.mode === 'paused' || state.mode === 'caught') {
    return { x: 700, y: 26 };
  }
  if (state.mode === 'instructions' ||
      state.mode === 'intro' ||
      state.mode === 'nameEntry' ||
      state.mode === 'tutorial' ||
      state.mode === 'exit') {
    return { x: W - 60, y: 22 };
  }
  return null;
}

function getMuteButton() {
  const pos = getMutePosition();
  if (!pos) return null;
  return {
    id: 'mute-toggle',
    muteButton: true,
    x: pos.x, y: pos.y,
    w: MUTE_W, h: MUTE_H
  };
}

/* ------------------------------------------------------------
   BACK BUTTON + navigation
   Every screen except the main menu gets a BACK button in the
   top-left corner. goBack() steps to the PREVIOUS page:

     menu -> sceneSelect -> diffSelect -> (nameEntry, first time only) -> game

   In-game, Back opens the pause menu (Resume / Restart / Main Menu),
   and Back from the pause menu returns to the game.
   ------------------------------------------------------------ */
const BACK_W = 92;
const BACK_H = 32;

function getBackPosition() {
  switch (state.mode) {
    case 'instructions':
    case 'intro':
    case 'sceneSelect':
    case 'diffSelect':
    case 'nameEntry':
    case 'tutorial':
    case 'leaderboard':
    case 'user':
    case 'shop':
    case 'exit':
      return { x: 16, y: 12 };
    case 'playing':
    case 'paused':
    case 'caught':
      /* sits just under the HUD panel */
      return { x: 20, y: 90 };
    case 'win':
      return state.winT >= 3.5 ? { x: 16, y: 12 } : null;
    default:
      return null;   /* main menu is the root — nothing to go back to */
  }
}

export function getBackButton() {
  const pos = getBackPosition();
  if (!pos) return null;
  return { id: 'nav-back', backButton: true, x: pos.x, y: pos.y, w: BACK_W, h: BACK_H };
}

export function goBack() {
  switch (state.mode) {
    case 'instructions':
    case 'intro':
      state.instructionsScrollY = 0;
      state.instructionsScrollTarget = 0;
      state.mode = 'menu';
      break;
    case 'sceneSelect':
      state.mode = 'menu';
      break;
    case 'diffSelect':
      state.mode = 'sceneSelect';
      break;
    case 'nameEntry':
      state.mode = 'diffSelect';
      break;
    case 'tutorial':
      if (state.tutorialPage > 0) state.tutorialPage--;
      else state.mode = 'diffSelect';
      break;
    case 'leaderboard':
    case 'user':
    case 'shop':
    case 'exit':
    case 'caught':
    case 'win':
      state.mode = 'menu';
      break;
    case 'playing':
      state.mode = 'paused';
      for (const k in keys) keys[k] = false;
      break;
    case 'paused':
      state.mode = 'playing';
      break;
  }
}

/* Purchase confirmation modal geometry */
export function getPurchaseModalRects() {
  const cw = 460, ch = 260;
  const cx = W / 2 - cw / 2;
  const cy = H / 2 - ch / 2;
  return {
    cx, cy, cw, ch,
    cancel:  { x: cx + 20,  y: cy + ch - 76, w: 200, h: 52 },
    confirm: { x: cx + 240, y: cy + ch - 76, w: 200, h: 52 }
  };
}

function getPurchaseModalButtons() {
  const r = getPurchaseModalRects();
  return [
    { id:'cancel-purchase',  label:'CANCEL',  x: r.cancel.x,  y: r.cancel.y,  w: r.cancel.w,  h: r.cancel.h,  accent:'#ff8a8a' },
    { id:'confirm-purchase', label:'CONFIRM', x: r.confirm.x, y: r.confirm.y, w: r.confirm.w, h: r.confirm.h, accent:'#a8e6a0' }
  ];
}

function getBaseButtons() {
  const cx = W / 2;

  if (state.mode === 'menu') {
    const bw = 300, bh = 44;
    return [
      { id:'play',         label:'PLAY',         x: cx-bw/2, y: 252, w: bw, h: bh, accent:'#ffd24a' },
      { id:'instructions', label:'INSTRUCTIONS', x: cx-bw/2, y: 302, w: bw, h: bh, accent:'#7ee0ff' },
      { id:'leaderboard',  label:'LEADERBOARD',  x: cx-bw/2, y: 352, w: bw, h: bh, accent:'#ffb84d' },
      { id:'shop',         label:'OUTFIT SHOP',  x: cx-bw/2, y: 402, w: bw, h: bh, accent:'#c8a8ff' },
      { id:'exit',         label:'EXIT',         x: cx-bw/2, y: 452, w: bw, h: bh, accent:'#ff8a8a' },
      /* User icon (+ name pill) in the top-left corner */
      { id:'user-open', userButton:true, x: 20, y: 20,
        w: save.playerName && save.playerName.trim() ? 236 : 40, h: 40 },
    ];
  }
  if (state.mode === 'instructions') {
    return [{ id:'back', label:'BACK TO MENU', x: cx-150, y: 462, w: 300, h: 46, accent:'#ffd24a' }];
  }
  if (state.mode === 'intro') {
    const ready = state.introT >= 3;
    return [{
      id:'intro-continue',
      label: ready ? 'CONTINUE' : 'READ CAREFULLY  ·  ' + Math.max(1, Math.ceil(3 - state.introT)),
      x: cx-240, y: 480, w: 480, h: 44,
      accent: ready ? '#a8e6a0' : '#8a7a55',
      disabled: !ready
    }];
  }
  if (state.mode === 'sceneSelect') {
    const cw = 260, chh = 270;
    const gap = (W - cw * 3) / 4;
    return [
      { id:'scene-night',   card:true, sceneKey:'night',   x: gap,             y:140, w:cw, h:chh },
      { id:'scene-day',     card:true, sceneKey:'day',     x: gap*2 + cw,      y:140, w:cw, h:chh },
      { id:'scene-evening', card:true, sceneKey:'evening', x: gap*3 + cw*2,    y:140, w:cw, h:chh },
      { id:'scene-back',    label:'BACK', x: cx-110, y:462, w:220, h:42, accent:'#ffd24a' }
    ];
  }
  if (state.mode === 'diffSelect') {
    const cw = 260, chh = 270;
    const gap = (W - cw * 3) / 4;
    return [
      { id:'diff-easy',   card:true, diffKey:'easy',   x: gap,             y:140, w:cw, h:chh },
      { id:'diff-medium', card:true, diffKey:'medium', x: gap*2 + cw,      y:140, w:cw, h:chh },
      { id:'diff-hard',   card:true, diffKey:'hard',   x: gap*3 + cw*2,    y:140, w:cw, h:chh },
      { id:'diff-back',   label:'BACK', x: cx-110, y:462, w:220, h:42, accent:'#ffd24a' }
    ];
  }
  if (state.mode === 'tutorial') {
    const last = state.tutorialPage >= TUTORIAL_PAGES - 1;
    const btns = [{
      id:'tut-next',
      label: last ? 'START GAME' : 'NEXT',
      x: cx - 150, y: 474, w: 300, h: 44,
      accent: last ? '#a8e6a0' : '#ffd24a'
    }];
    if (!last) btns.push({ id:'tut-skip', label:'SKIP', x: W - 150, y: 480, w: 110, h: 32, accent:'#8a7a55' });
    return btns;
  }
  if (state.mode === 'nameEntry') {
    const ready = (state.nameDraft || '').trim().length >= 1;
    return [{
      id:'name-go',
      label: ready ? 'CONFIRM NAME & PLAY' : 'TYPE A NAME TO BEGIN',
      x: cx - 180, y: 434, w: 360, h: 44,
      accent: ready ? '#a8e6a0' : '#8a7a55',
      disabled: !ready
    }];
  }
  if (state.mode === 'leaderboard') {
    const bw = 240;
    return [
      { id:'lb-refresh', label:'REFRESH',      x: cx - bw - 10, y: 482, w: bw, h: 44, accent:'#a8e6a0' },
      { id:'lb-back',    label:'BACK TO MENU', x: cx + 10,      y: 482, w: bw, h: 44, accent:'#ffd24a' }
    ];
  }
  if (state.mode === 'user') {
    const bw = 240;
    const hasName = save.playerName && save.playerName.trim().length > 0;
    return [
      hasName
        ? { id:'user-refresh', label:'REFRESH', x: cx - bw - 10, y: 482, w: bw, h: 44, accent:'#a8e6a0' }
        : { id:'play',         label:'PLAY',    x: cx - bw - 10, y: 482, w: bw, h: 44, accent:'#a8e6a0' },
      { id:'user-back', label:'BACK TO MENU', x: cx + 10, y: 482, w: bw, h: 44, accent:'#ffd24a' }
    ];
  }
  if (state.mode === 'shop') {
    const btns = [{ id:'shop-back', label:'BACK TO MENU', x: cx-160, y:470, w:320, h:44, accent:'#ffd24a' }];
    const cols = 3, cardW = 280, cardH = 140;
    const gapX = (W - cardW * cols) / 4;
    const startY = 130, rowGap = 18;
    const keys = Object.keys(OUTFITS);
    for (let i = 0; i < keys.length; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      btns.push({
        id: 'outfit-' + keys[i], outfitCard: true, outfitKey: keys[i],
        x: gapX + col * (cardW + gapX),
        y: startY + row * (cardH + rowGap),
        w: cardW, h: cardH
      });
    }
    return btns;
  }
  if (state.mode === 'exit') {
    return [{ id:'exit-back', label:'RETURN TO MENU', x: cx-160, y:388, w:320, h:54, accent:'#ffd24a' }];
  }
  if (state.mode === 'paused') {
    const bw = 340, bh = 54;
    return [
      { id:'resume',  label:'RESUME',      x: cx-bw/2, y:274, w:bw, h:bh, accent:'#a8e6a0' },
      { id:'restart', label:'RESTART RUN', x: cx-bw/2, y:340, w:bw, h:bh, accent:'#ffd24a' },
      { id:'quit',    label:'MAIN MENU',   x: cx-bw/2, y:406, w:bw, h:bh, accent:'#ff8a8a' },
    ];
  }
  if (state.mode === 'caught') {
    return [{ id:'caught-menu', label:'MAIN MENU', x: cx-130, y:430, w:260, h:48, accent:'#ff8a8a' }];
  }
  if (state.mode === 'win') {
    if (state.winT < 3.5) return [];
    const canNext = state.newSceneUnlocked !== null;
    const btns = [];
    if (canNext) {
      btns.push({ id:'win-next',  label:'NEXT SCENE', x: cx-380, y:478, w:240, h:50, accent:'#a8e6a0' });
      btns.push({ id:'win-again', label:'PLAY AGAIN', x: cx-120, y:478, w:240, h:50, accent:'#ffd24a' });
      btns.push({ id:'win-menu',  label:'MAIN MENU',  x: cx+140, y:478, w:240, h:50, accent:'#7ee0ff' });
    } else {
      btns.push({ id:'win-again', label:'PLAY AGAIN', x: cx-280, y:478, w:260, h:50, accent:'#ffd24a' });
      btns.push({ id:'win-menu',  label:'MAIN MENU',  x: cx+20, y:478, w:260, h:50, accent:'#7ee0ff' });
    }
    return btns;
  }
  return [];
}

export function getCurrentButtons() {
  /* Modal takes precedence over everything */
  if (state.pendingPurchase) return getPurchaseModalButtons();

  const list = getBaseButtons();
  const mute = getMuteButton();
  if (mute) list.push(mute);
  const back = getBackButton();
  if (back) list.push(back);
  return list;
}

export function hitTestButton(mx, my) {
  for (const b of getCurrentButtons()) {
    if (b.disabled) continue;
    if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return b;
  }
  return null;
}

/* PLAY: go straight to scene select (the INSTRUCTIONS page covers the how-to) */
export function startPlayFlow() {
  initAudio();
  state.mode = 'sceneSelect';
}

/* Difficulty picked: ask for a name only if the player has never set one */
export function chooseDifficulty(diff) {
  initAudio();
  state.difficulty = diff;
  if (save.nameLocked && save.playerName.trim()) {
    launchGame();
  } else {
    state.nameDraft = '';
    state.mode = 'nameEntry';
  }
}

/* Name confirmed: lock it permanently, then start */
export function confirmName() {
  const name = (state.nameDraft || '').trim();
  if (name.length < 1) return;
  initAudio();
  save.playerName = name;
  save.nameLocked = true;
  persistSave();
  launchGame();
}

/* First run ever → the tutorial comes first, then the game starts */
function launchGame() {
  if (!save.tutorialDone) {
    state.tutorialPage = 0;
    state.mode = 'tutorial';
    return;
  }
  beginRun();
}

function beginRun() {
  state.delivered = 0;
  startGameWithCloudSync();
}

export function nextTutorialPage() {
  if (state.tutorialPage < TUTORIAL_PAGES - 1) state.tutorialPage++;
  else finishTutorial();
}

export function finishTutorial() {
  save.tutorialDone = true;
  persistSave();
  beginRun();
}

export function handleButton(id) {
  playClick();

  if (id === 'nav-back') { goBack(); return; }

  if (id === 'mute-toggle') {
    const nowMuted = toggleMute();
    state.muteToastMsg = nowMuted ? 'SOUND OFF' : 'SOUND ON';
    state.muteToast = 1.6;
    return;
  }

  /* ---- Purchase confirmation ---- */
  if (id === 'confirm-purchase') {
    const key = state.pendingPurchase;
    if (key) {
      const outfit = OUTFITS[key];
      if (outfit && save.coins >= outfit.cost) {
        save.coins -= outfit.cost;
        save.ownedOutfits.push(key);
        save.selectedOutfit = key;
        playCoin();
        persistSave();
        syncWallet();
      }
    }
    state.pendingPurchase = null;
    return;
  }
  if (id === 'cancel-purchase') {
    state.pendingPurchase = null;
    return;
  }

  if (id === 'play') {
    startPlayFlow();
    return;
  }
  if (id === 'intro-continue') {
    initAudio();
    state.instructionsScrollY = 0;
    state.mode = 'sceneSelect';
    return;
  }
  if (id === 'instructions') { state.mode = 'instructions'; return; }
  if (id === 'leaderboard') {
    state.mode = 'leaderboard';
    enterLeaderboard();
    return;
  }
  if (id === 'shop') { state.mode = 'shop'; return; }
  if (id === 'exit') { state.mode = 'exit'; try { window.open('', '_self').close(); } catch (e) {} return; }
  if (id === 'scene-back' || id === 'diff-back') { goBack(); return; }   // previous page, not the menu
  if (id === 'back' || id === 'exit-back' || id === 'shop-back') {
    state.mode = 'menu'; return;
  }
  if (id === 'lb-back') { state.mode = 'menu'; return; }
  if (id === 'user-open') { state.mode = 'user'; enterUserPage(); return; }
  if (id === 'user-refresh') { refreshUserData(true); return; }
  if (id === 'user-back') { state.mode = 'menu'; return; }
  if (id === 'lb-refresh') { refreshLeaderboard(true); return; }
  if (id.startsWith('scene-')) {
    const key = id.replace('scene-', '');
    if (!save.unlockedScenes[key]) return;
    state.scene = key;
    state.mode = 'diffSelect';
    return;
  }
  if (id.startsWith('diff-')) {
    chooseDifficulty(id.replace('diff-', ''));
    return;
  }
  if (id === 'name-go') { confirmName(); return; }
  if (id === 'tut-next') { nextTutorialPage(); return; }
  if (id === 'tut-skip') { finishTutorial(); return; }
  if (id.startsWith('outfit-')) {
    const key = id.replace('outfit-', '');
    const outfit = OUTFITS[key];
    if (!outfit) return;

    if (save.ownedOutfits.includes(key)) {
      /* Already owned — equip immediately, no confirmation needed */
      save.selectedOutfit = key;
      persistSave();
    } else if (save.coins >= outfit.cost) {
      /* Not owned, can afford — open confirmation */
      state.pendingPurchase = key;
    }
    /* If can't afford, do nothing (card already shows "NEED X MORE") */
    return;
  }
  if (id === 'resume') { state.mode = 'playing'; return; }
  if (id === 'restart') {
    initAudio();
    state.delivered = 0;
    import('../gameplay/rounds.js').then(m => m.startRound(1));
    return;
  }
  if (id === 'quit') { state.mode = 'menu'; return; }
  if (id === 'win-again') {
    initAudio();
    state.delivered = 0;
    import('../gameplay/rounds.js').then(m => m.startRound(1));
    return;
  }
  if (id === 'win-next') {
    const idx = SCENE_ORDER.indexOf(state.scene);
    if (idx >= 0 && idx < SCENE_ORDER.length - 1) {
      state.scene = SCENE_ORDER[idx + 1];
      state.mode = 'diffSelect';
    } else state.mode = 'menu';
    return;
  }
  if (id === 'win-menu' || id === 'caught-menu') { state.mode = 'menu'; return; }
}