/* Accessory drawing helpers shared by all three character renderers.
   All coordinates are in the character's local space with the origin
   at the feet, head drawn upward (negative y). Caller applies scale. */

export function drawHairStyle(ctx, headX, headY, headR, style, accent, hairColor) {
  if (!style || style === 'simple') return;

  if (style === 'bun') {
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(headX - headR - 3, headY - 3, headR * 0.45, 0, Math.PI * 2);
    ctx.fill();
    /* Highlight */
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(headX - headR - 4, headY - 4, headR * 0.18, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (style === 'topknot') {
    /* Hair gathered up */
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(headX + 1, headY - headR - 3, headR * 0.42, 0, Math.PI * 2);
    ctx.fill();
    /* Gold band */
    ctx.strokeStyle = accent || '#ffd24a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(headX + 1, headY - headR - 1, headR * 0.42, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    /* Feather accent */
    ctx.save();
    ctx.translate(headX + 1, headY - headR - 4);
    ctx.rotate(-0.5);
    ctx.fillStyle = accent || '#e0f0ff';
    ctx.beginPath();
    ctx.ellipse(0, -5, 1.8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (style === 'turban') {
    /* Wrapped fabric above the head */
    ctx.fillStyle = accent || '#fff0c8';
    ctx.beginPath();
    ctx.ellipse(headX, headY - headR + 1, headR * 1.20, headR * 0.85, 0, Math.PI, 0);
    ctx.fill();
    /* Wrap line */
    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(headX - headR * 1.1, headY - headR + 3);
    ctx.quadraticCurveTo(headX, headY - headR - 6, headX + headR * 1.1, headY - headR + 3);
    ctx.stroke();
    /* Knot at the side */
    ctx.fillStyle = accent || '#fff0c8';
    ctx.beginPath();
    ctx.arc(headX + headR * 0.75, headY - headR - 1, headR * 0.30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.arc(headX + headR * 0.75, headY - headR - 1, headR * 0.18, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (style === 'leafcrown') {
    const greens = [accent || '#4a9e30', '#6bc86a', '#3e8030', '#5bb850'];
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * 1.05 + (i / 8) * Math.PI * 0.90;
      const lx = headX + Math.cos(a) * (headR + 1);
      const ly = headY + Math.sin(a) * (headR + 1);
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(a + Math.PI * 0.5);
      ctx.fillStyle = greens[i % greens.length];
      ctx.beginPath();
      ctx.ellipse(0, -3.5, 2.2, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      /* Leaf vein */
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.restore();
    }
    /* Flower in the middle */
    ctx.fillStyle = '#ff6b9d';
    ctx.beginPath();
    ctx.arc(headX, headY - headR - 3, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd24a';
    ctx.beginPath();
    ctx.arc(headX, headY - headR - 3, 1.4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (style === 'crown') {
    const cy = headY - headR - 1;
    const col = accent || '#ffd24a';
    ctx.fillStyle = col;
    ctx.strokeStyle = 'rgba(140,90,10,0.7)';
    ctx.lineWidth = 0.9;

    /* Base band */
    ctx.beginPath();
    ctx.moveTo(headX - headR, cy);
    ctx.lineTo(headX + headR, cy);
    ctx.lineTo(headX + headR - 1.5, cy + 4);
    ctx.lineTo(headX - headR + 1.5, cy + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    /* Decorative dots on the band */
    for (let i = -2; i <= 2; i++) {
      ctx.fillStyle = '#e8474c';
      ctx.beginPath();
      ctx.arc(headX + i * (headR * 0.35), cy + 2, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = col;

    /* Three points */
    for (let i = -1; i <= 1; i++) {
      const px = headX + i * headR * 0.65;
      const py = cy - 7 + Math.abs(i) * 2;
      ctx.beginPath();
      ctx.moveTo(px - 3, cy);
      ctx.lineTo(px, py);
      ctx.lineTo(px + 3, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      /* Gem */
      ctx.fillStyle = '#e8474c';
      ctx.beginPath();
      ctx.arc(px, py + 1, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
    }
    return;
  }

  if (style === 'crescent') {
    const cy = headY - headR - 4;
    const col = accent || '#c8b8ff';
    ctx.save();
    ctx.translate(headX, cy);

    /* Crescent shape via two arcs */
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
    ctx.fill();

    /* Cut out the inner circle to make a crescent */
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(2.8, 0, 6.0, 0, Math.PI * 2);
    ctx.fill();

    /* Reset composite mode */
    ctx.globalCompositeOperation = 'source-over';

    /* Glow behind the crescent */
    ctx.globalAlpha = 0.5;
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 12);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    /* Star dust */
    ctx.fillStyle = '#fff8d0';
    const stars = [[-8, -6], [9, -7], [-5, 4], [7, 5], [0, -9]];
    for (const [dx, dy] of stars) {
      ctx.beginPath();
      ctx.arc(headX + dx, cy + dy, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
}

export function drawKurtaPattern(ctx, x, y, w, h, pattern, color) {
  if (!pattern || pattern === 'none') return;

  if (pattern === 'stars') {
    ctx.fillStyle = color || 'rgba(255,255,255,0.75)';
    const positions = [
      [-w*0.25, -h*0.32], [w*0.20, -h*0.38], [w*0.05, -h*0.12],
      [-w*0.30, -h*0.05], [w*0.28, h*0.02], [-w*0.05, h*0.15],
      [w*0.15, h*0.28], [-w*0.22, h*0.30]
    ];
    for (const [dx, dy] of positions) {
      const sx = x + w/2 + dx;
      const sy = y + h/2 + dy;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 2);
      ctx.lineTo(sx + 0.6, sy - 0.6);
      ctx.lineTo(sx + 2, sy);
      ctx.lineTo(sx + 0.6, sy + 0.6);
      ctx.lineTo(sx, sy + 2);
      ctx.lineTo(sx - 0.6, sy + 0.6);
      ctx.lineTo(sx - 2, sy);
      ctx.lineTo(sx - 0.6, sy - 0.6);
      ctx.closePath();
      ctx.fill();
    }
    return;
  }

  if (pattern === 'dots') {
    ctx.fillStyle = color || 'rgba(255,255,255,0.72)';
    const positions = [
      [-w*0.28, -h*0.35], [0, -h*0.40], [w*0.28, -h*0.28],
      [-w*0.15, -h*0.10], [w*0.18, -h*0.08],
      [-w*0.30, h*0.10], [w*0.10, h*0.18], [w*0.28, h*0.30],
      [-w*0.18, h*0.32]
    ];
    for (const [dx, dy] of positions) {
      ctx.beginPath();
      ctx.arc(x + w/2 + dx, y + h/2 + dy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
}

export function drawNecklace(ctx, neckX, neckY, color) {
  const col = color || '#ffd24a';
  /* Chain */
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(neckX, neckY - 1, 5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  /* Beads along the chain */
  for (let i = 0; i < 5; i++) {
    const a = 0.20 * Math.PI + (i / 4) * 0.60 * Math.PI;
    const bx = neckX + Math.cos(a) * 5;
    const by = neckY - 1 + Math.sin(a) * 5;
    ctx.fillStyle = '#e8474c';
    ctx.beginPath();
    ctx.arc(bx, by, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  /* Pendant */
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(neckX, neckY + 4, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(neckX - 0.7, neckY + 3.3, 0.8, 0, Math.PI * 2);
  ctx.fill();
}

export function drawEarrings(ctx, headX, headY, headR, color) {
  const col = color || '#ffd24a';
  /* Left */
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(headX - headR + 1, headY + 4, 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(headX - headR + 0.4, headY + 3.4, 0.6, 0, Math.PI * 2);
  ctx.fill();
  /* Right */
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(headX + headR - 1, headY + 4, 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(headX + headR - 1.6, headY + 3.4, 0.6, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCharacterGlow(ctx, x, y, w, h, glowColor) {
  if (!glowColor) return;
  const cx = x + w/2;
  const cy = y + h/2;
  const r = Math.max(w, h) * 1.2;
  const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, r);
  g.addColorStop(0, glowColor);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}