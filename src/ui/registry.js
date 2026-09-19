import { W, H } from '../core/canvas.js';
import { state } from '../core/state.js';
import { save, persistSave } from '../core/save.js';
import { SCENE_ORDER, SCENES } from '../data/scenes.js';
import { OUTFITS } from '../data/outfits.js';
import { initAudio, playCoin, playClick, playSceneUnlock, playRoundStart } from '../core/audio.js';
import { syncWallet, startGameWithCloudSync, loadPlayerFromCloud } from '../cloud.js';

export function getCurrentButtons() {
  const cx = W / 2;

  if (state.mode === 'menu') {
    const bw = 300, bh = 44;
    return [
      { id:'play',         label:'PLAY',         x: cx-bw/2, y: 252, w: bw, h: bh, accent:'#ffd24a' },
      { id:'instructions', label:'INSTRUCTIONS', x: cx-bw/2, y: 302, w: bw, h: bh, accent:'#7ee0ff' },
      { id:'leaderboard',  label:'LEADERBOARD',  x: cx-bw/2, y: 352, w: bw, h: bh, accent:'#ffb84d' },
      { id:'shop',         label:'OUTFIT SHOP',  x: cx-bw/2, y: 402, w: bw, h: bh, accent:'#c8a8ff' },
      { id:'exit',         label:'EXIT',         x: cx-bw/2, y: 452, w: bw, h: bh, accent:'#ff8a8a' },
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
  if (state.mode === 'nameEntry') {
    const ready = save.playerName.trim().length >= 1;
    return [{
      id:'name-go',
      label: ready ? 'LETS GO' : 'TYPE A NAME TO BEGIN',
      x: cx - 180, y: 410, w: 360, h: 46,
      accent: ready ? '#a8e6a0' : '#8a7a55',
      disabled: !ready
    }];
  }
  if (state.mode === 'leaderboard') {
    return [
      { id:'lb-reset', label:'RESET', x: 40, y: 482, w: 160, h: 44, accent:'#ff8a8a' },
      { id:'lb-back',  label:'BACK TO MENU', x: cx-160, y: 482, w: 320, h: 44, accent:'#ffd24a' }
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

export function hitTestButton(mx, my) {
  for (const b of getCurrentButtons()) {
    if (b.disabled) continue;
    if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return b;
  }
  return null;
}

export function handleButton(id) {
  playClick();

  if (id === 'play') {
    initAudio();
    playClick();
    state.mode = 'intro';
    state.introT = 0;
    state.instructionsScrollY = 0;
    return;
  }
  if (id === 'intro-continue') {
    initAudio();
    state.instructionsScrollY = 0;
    state.mode = 'sceneSelect';
    return;
  }
  if (id === 'instructions') { state.mode = 'instructions'; return; }
  if (id === 'leaderboard') { state.mode = 'leaderboard'; return; }
  if (id === 'shop') { state.mode = 'shop'; return; }
  if (id === 'exit') { state.mode = 'exit'; try { window.open('', '_self').close(); } catch (e) {} return; }
  if (id === 'back' || id === 'exit-back' || id === 'scene-back' || id === 'diff-back' || id === 'shop-back') {
    state.mode = 'menu'; return;
  }
  if (id === 'lb-back') { state.mode = 'menu'; return; }
  if (id === 'lb-reset') {
    save.leaderboard = [];
    persistSave();
    return;
  }
  if (id.startsWith('scene-')) {
    const key = id.replace('scene-', '');
    if (!save.unlockedScenes[key]) return;
    state.scene = key;
    state.mode = 'diffSelect';
    return;
  }
  if (id.startsWith('diff-')) {
    initAudio();
    state.difficulty = id.replace('diff-', '');
    state.mode = 'nameEntry';
    return;
  }
  if (id === 'name-go') {
    if (save.playerName.trim().length < 1) return;
    initAudio();
    save.playerName = save.playerName.trim();
    persistSave();
    state.delivered = 0;
    startGameWithCloudSync();
    return;
  }
  if (id.startsWith('outfit-')) {
    const key = id.replace('outfit-', '');
    const outfit = OUTFITS[key];
    if (save.ownedOutfits.includes(key)) {
      save.selectedOutfit = key;
      persistSave();
    } else if (save.coins >= outfit.cost) {
      save.coins -= outfit.cost;
      save.ownedOutfits.push(key);
      save.selectedOutfit = key;
      playCoin();
      persistSave();
      syncWallet();
    }
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