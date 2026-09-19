import { player, world } from '../core/state.js';
import { GROUND_Y, GRAV } from '../core/config.js';
import { aabb } from '../util/drawing.js';
import { obstacles } from '../world/obstacles.js';

export function playerBox() {
  const h = player.crouching ? 40 : 78;
  const w = player.crouching ? 32 : 28;
  return { x: player.x - w/2, y: player.y - h, w, h };
}

export function movePlayer(dt, vx) {
  player.x += vx * dt;
  player.x = Math.max(60, Math.min(world.W - 50, player.x));

  let pb = playerBox();
  for (const o of obstacles) {
    const ob = { x: o.x, y: o.y, w: o.w, h: o.h };
    if (aabb(pb, ob)) {
      const pc = pb.x + pb.w/2, oc = ob.x + ob.w/2;
      if (pc < oc) player.x = ob.x - pb.w/2 - 1;
      else player.x = ob.x + ob.w + pb.w/2 + 1;
      pb = playerBox();
    }
  }

  player.vy += GRAV * dt;
  player.y += player.vy * dt;
  player.onGround = false;
  if (player.y >= GROUND_Y) {
    player.y = GROUND_Y; player.vy = 0; player.onGround = true;
  }

  const pb2 = playerBox();
  for (const o of obstacles) {
    if (o.air) continue;
    const ob = { x: o.x, y: o.y, w: o.w, h: o.h };
    if (aabb(pb2, ob)) {
      const feet = pb2.y + pb2.h;
      if (player.vy >= 0 && feet - ob.y < 30 && feet > ob.y) {
        player.y = ob.y; player.vy = 0; player.onGround = true;
      }
    }
  }

  const pb3 = playerBox();
  for (const o of obstacles) {
    if (!o.air) continue;
    const ob = { x: o.x, y: o.y, w: o.w, h: o.h };
    if (aabb(pb3, ob)) {
      const pc = pb3.x + pb3.w/2, oc = ob.x + ob.w/2;
      if (pc < oc) player.x = ob.x - pb3.w/2 - 1;
      else player.x = ob.x + ob.w + pb3.w/2 + 1;
    }
  }
}