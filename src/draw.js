import { ctx, W, H } from './core/canvas.js';
import { state, camera, world, ui } from './core/state.js';
import { SCENES } from './data/scenes.js';
import { rrect } from './util/drawing.js';

import { drawSky, drawCelestial, drawClouds, drawStars, drawHouses, drawDistantGround, drawRoad } from './world/background.js';
import { drawPandal } from './world/pandal.js';
import { drawStartTable, drawInteractPrompt } from './world/props.js';
import { drawObstacles } from './world/obstacles.js';
import { drawAmbient, drawParticles } from './world/particles.js';
import { drawPlayer } from './player/draw.js';

import { drawMenuScreen } from './screens/menu.js';
import { drawIntroScreen } from './screens/intro.js';
import { drawInstructionsScreen } from './screens/instructions.js';
import { drawSceneSelectScreen } from './screens/sceneSelect.js';
import { drawDiffSelectScreen } from './screens/diffSelect.js';
import { drawLeaderboardScreen } from './screens/leaderboard.js';
import { drawShopScreen } from './screens/shop.js';
import { drawExitScreen } from './screens/exit.js';
import { drawHUD } from './screens/hud.js';
import { drawPauseOverlay } from './screens/pause.js';
import { drawOverlay, drawCheatToast } from './screens/overlays.js';
import { drawNameEntryScreen } from './screens/nameEntry.js';
import { drawCoins } from './world/coins.js';
import { drawTouchControls } from './ui/touchControls.js';
import { drawInstructionsMobileScreen, drawIntroMobileScreen } from './screens/instructionsMobile.js';

export function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);

  if (state.mode === 'menu')         { drawMenuScreen();         return; }
  if (state.mode === 'intro') {
    if (ui.hasTouch) drawIntroMobileScreen();
    else             drawIntroScreen();
    return;
  }
  if (state.mode === 'instructions') {
    if (ui.hasTouch) drawInstructionsMobileScreen();
    else             drawInstructionsScreen();
    return;
  }
if (state.mode === 'sceneSelect')  { drawSceneSelectScreen();  return; }
if (state.mode === 'diffSelect')   { drawDiffSelectScreen();   return; }
if (state.mode === 'nameEntry')    { drawNameEntryScreen();    return; }
if (state.mode === 'leaderboard')  { drawLeaderboardScreen();  return; }
if (state.mode === 'shop')         { drawShopScreen();         return; }
if (state.mode === 'exit')         { drawExitScreen();         return; }

  ctx.save();
  if (state.shake > 0) {
    const m = state.shake * 9;
    ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
  }

  drawSky();
  drawCelestial();
  drawClouds();
  drawStars();
  drawHouses();
  drawDistantGround();
  drawRoad();

  ctx.save();
  ctx.translate(-Math.round(camera.x), 0);
  drawStartTable();
  drawInteractPrompt();
  drawPandal();
  drawObstacles();
  drawCoins();
  drawAmbient();
  drawPlayer();
  drawParticles();
  ctx.restore();


  const scene = SCENES[state.scene];
  if (scene.fogTint && scene.fogTint !== 'rgba(0,0,0,0)') {
    ctx.fillStyle = scene.fogTint;
    ctx.fillRect(0, 0, W, H);
  }

  const vg = ctx.createRadialGradient(W/2, H/2, H * 0.4, W/2, H/2, H * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  ctx.restore();

    drawHUD();
  drawOverlay();
  if (state.mode === 'paused') drawPauseOverlay();
  drawCheatToast();
    drawTouchControls();
  drawFullscreenToast();
}

function drawFullscreenToast() {
  if (!state.fullscreenToast || state.fullscreenToast <= 0) return;
  const a = Math.min(1, state.fullscreenToast / 0.4);

  const tw = 380, th = 68;
  const tx = W / 2 - tw / 2;
  const ty = 20;

  ctx.save();
  ctx.globalAlpha = a;
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = 'rgba(20, 10, 8, 0.96)';
  rrect(tx, ty, tw, th, 14);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = 'rgba(255,210,74,0.85)';
  ctx.lineWidth = 2;
  rrect(tx, ty, tw, th, 14);
  ctx.stroke();

  ctx.fillStyle = '#ffd24a';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GOING FULLSCREEN...', W / 2, ty + 22);

  ctx.fillStyle = 'rgba(255, 240, 210, 0.85)';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('Chrome shows a notice for 2-3s. Just wait.', W / 2, ty + 44);

  ctx.restore();
}
function drawMuteToast() {
  if (state.muteToast <= 0) return;
  const a = Math.min(1, state.muteToast / 0.35);
  ctx.save();
  ctx.globalAlpha = a;
  const tw = 200, th = 44;
  const tx = W / 2 - tw / 2, ty = 200;
  ctx.fillStyle = 'rgba(12,4,16,0.94)';
  rrect(tx, ty, tw, th, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(200,200,255,0.7)';
  ctx.lineWidth = 2;
  rrect(tx, ty, tw, th, 12); ctx.stroke();
  ctx.fillStyle = '#dcdcff';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(state.muteToastMsg, W / 2, ty + th / 2 + 1);
  ctx.restore();
}