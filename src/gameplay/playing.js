import { state, player, keys, camera, world } from '../core/state.js';
import { GROUND_Y, PLATE_X, INTERACT_RANGE, JUMP_V, SPEED, CROUCH_SPEED } from '../core/config.js';
import { DIFFICULTIES } from '../data/difficulties.js';
import { movePlayer } from '../player/physics.js';
import { updateLightCycle } from './lightCycle.js';
import { placeModak, onCaught } from './rounds.js';
import { updateCoins } from '../world/coins.js';
import { playDrum, playJump, playFootstep } from '../core/audio.js';
import { spawnSparkles } from '../world/particles.js';

function isAltHeld()  { return !!keys['Alt'] || !!keys['alt'] || !!keys['AltGraph']; }
function isLeftHeld() { return !!keys['a'] || !!keys['A'] || !!keys['ArrowLeft']; }
function isRightHeld(){ return !!keys['d'] || !!keys['D'] || !!keys['ArrowRight']; }
function isJumpHeld() { return !!keys['w'] || !!keys['W'] || !!keys['ArrowUp'] || !!keys[' ']; }
function isCrouchHeld(){ return !!keys['s'] || !!keys['S'] || !!keys['ArrowDown']; }

export function updatePlaying(dt) {
  updateLightCycle(dt);

  const holdingAlt = isAltHeld();
  player.aarti = holdingAlt && player.onGround;
  player.crouching = player.onGround && isCrouchHeld();

  const diff = DIFFICULTIES[state.difficulty];
  let vx = 0;
  if (!holdingAlt) {
    const spd = (player.crouching ? CROUCH_SPEED : SPEED) * diff.speedMul;
    if (isLeftHeld())  { vx = -spd; player.facing = -1; }
    else if (isRightHeld()) { vx = spd; player.facing = 1; }
  }

  const jumpKey = isJumpHeld();
  if (jumpKey && player.onGround && !holdingAlt && !player.crouching && !player.jumpHeld) {
    player.vy = JUMP_V; player.onGround = false; player.jumpHeld = true;
    playDrum(0.16);
  }
  if (!jumpKey) player.jumpHeld = false;

  player.moving = Math.abs(vx) > 0 && player.onGround;

    /* Footsteps — sync with run animation */
  if (player.moving) {
    const prevAnim = player.animT;
    player.animT += dt * 13;
    if (Math.floor(player.animT / Math.PI) !== Math.floor(prevAnim / Math.PI)) {
      playFootstep();
    }
    /* Undo so the block below uses the original accumulation logic */
    player.animT = prevAnim;
  }

  /* Distance tracking: only count deliberate movement, not teleports */
   if (Math.abs(vx) > 0) {
    state.runDistance += Math.abs(vx * dt);
    state.score = Math.floor(state.runDistance / 10);
  }
  movePlayer(dt, vx);
  updateCoins(dt);

  if (player.interactRequested) {
    player.interactRequested = false;
    if (player.onGround) {
      if (player.holding && Math.abs(player.x - world.placeX) < INTERACT_RANGE) {
        placeModak(); return;
      }
      if (!player.holding && state.delivered < 5 && Math.abs(player.x - PLATE_X) < INTERACT_RANGE) {
        player.holding = true;
        spawnSparkles(player.x, player.y - 65, 12, '#ffd24a');
        playDrum(0.22);
      }
    }
  }

  if (player.moving) player.animT += dt * 13;
  else player.animT += dt * 2.2;

  if (state.lightPhase === 'red' && state.graceT <= 0) {
    if (!holdingAlt || !player.onGround) { onCaught(); return; }
  }
}