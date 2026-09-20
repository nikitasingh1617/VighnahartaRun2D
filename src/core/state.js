import { GROUND_Y } from './config.js';

export const state = {
  mode: 'menu',
  tutorialPage: 0,          // current page of the one-time tutorial
  nameDraft: '',            // name being typed on the name-entry screen (not saved until confirmed)
  scene: 'night',
  difficulty: 'medium',
  round: 1,
  delivered: 0,
  lightPhase: 'green',
  lightT: 0, graceT: 0, beatT: 0,
  timer: 0, flash: 0, shake: 0, fade: 0,
  introT: 0, winT: 0,
  cheatToast: 0, cheatMsg: '',
  muteToast: 0, muteToastMsg: '',
  score: 0, roundScores: [], roundStartTime: 0,
  completionBonus: 0, coinsEarned: 0,
  runDistance: 0,
  runStartTime: 0,
  runCoins: 0,
  finalRunTime: 0,
  finalRunDistance: 0,
  finalRunCoins: 0,
  instructionsScrollY: 0,
  instructionsScrollTarget: 0,
  instructionsMaxScroll: 0,
  newBest: false, newSceneUnlocked: null,
  celebration: null,
  showFullscreenNotice: false,
  pendingButtonAction: null,
  pendingPurchase: null,
  runRoundsCompleted: 0,
  fullscreenToast: 0,
};

export const player = {
  x: 210, y: GROUND_Y, vy: 0, onGround: true,
  facing: 1, animT: 0, holding: false, aarti: false,
  moving: false, jumpHeld: false,
  crouching: false, interactRequested: false, pooja: false,
};

export const keys = {};

export const camera = { x: 0, time: 0 };

export const world = { W: 0, max: 0, pandalCx: 0, placeX: 0 };

export const ui = {
  hoveredId: null,
  mouseX: -1,
  mouseY: -1,
  hasTouch: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0),
  touchPressed: {},          // { [buttonId]: boolean }
  activePointers: new Map(), // pointerId -> button
};

export function setWorldBounds(totalW, camMax, pandal, place) {
  world.W = totalW; world.max = camMax;
  world.pandalCx = pandal; world.placeX = place;
}