
window.particleSize = 5;
window.restDensity = 1;
window.gravity = 0.05;
window.smoothing = 1;

const gui = new dat.GUI();
gui.add(window, 'particleSize', 0, 100);
gui.add(window, 'restDensity', 0.1, 5.0);
gui.add(window, 'gravity', 0, 0.2);
gui.add(window, 'smoothing', 0, 1);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
onResize();
window.addEventListener('resize', onResize, false);

function Particle(x, y, u, v) {
  this.x = x;
  this.y = y;
  this.u = u;
  this.v = v;
  this.gu = u;
  this.gv = v;

  this.dudx = 0;
  this.dudy = 0;
  this.dvdx = 0;
  this.dvdy = 0;
  this.cx = 0;
  this.cy = 0;
  this.gi = 0;

  this.px = [0, 0, 0];
  this.py = [0, 0, 0];
  this.gx = [0, 0, 0];
  this.gy = [0, 0, 0];
}

function Node() {
  this.m = 0;
  this.d = 0;
  this.gx = 0;
  this.gy = 0;
  this.u = 0;
  this.v = 0;
  this.ax = 0;
  this.ay = 0;
}

// initialize
const particles = [];
const grid = [];
for (let i = 0; i < 40; i += 1) {
  for (let j = 0; j < 40; j += 1) {
    particles.push(new Particle(i, j, 0.1, 0));
  }
}

const accelX = 0;
const accelY = 0;

let minX = particles[0].x;
let minY = particles[0].y;
let maxX = minX;
let maxY = minY;
let gsizeY;
const particleCount = particles.length;
for (let i = 0; i < particleCount; i += 1) {
  const p = particles[i];
  if (p.x < minX) {
    minX = p.x;
  } else if (p.x > maxX) {
    maxX = p.x;
  }
  if (p.y < minY) {
    minY = p.y;
  } else if (p.y > maxY) {
    maxY = p.y;
  }
}

minX = Math.floor(minX - 1);
minY = Math.floor(minY - 1);
maxX = Math.floor(maxX + 3);
maxY = Math.floor(maxY + 3);

let wx = window.screenX;
let wy = window.screenY;
function render() {
  const bx = canvas.width / window.particleSize - 1;
  const by = canvas.height / window.particleSize - 1;
  grid.length = 0;
  gsizeY = Math.floor(maxY - minY);

  const wdx = (window.screenX - wx) / window.particleSize;
  const wdy = (window.screenY - wy) / window.particleSize;
  wx = window.screenX;
  wy = window.screenY;
  for (let pi = 0; pi < particleCount; pi += 1) {
    const p = particles[pi];
    p.cx = Math.floor(p.x - minX - 0.5);
    p.cy = Math.floor(p.y - minY - 0.5);
    p.gi = p.cx * gsizeY + p.cy;

    let x = p.cx - (p.x - minX);
    p.px[0] = (0.5 * x * x + 1.5 * x + 1.125);
    p.gx[0] = ((x++) + 1.5);
    p.px[1] = (-x * x + 0.75);
    p.gx[1] = (-2.0 * (x++));
    p.px[2] = (0.5 * x * x - 1.5 * x + 1.125);
    p.gx[2] = (x - 1.5);

    let y = p.cy - (p.y - minY);
    p.py[0] = (0.5 * y * y + 1.5 * y + 1.125);
    p.gy[0] = ((y++) + 1.5);
    p.py[1] = (-y * y + 0.75);
    p.gy[1] = (-2.0 * (y++));
    p.py[2] = (0.5 * y * y - 1.5 * y + 1.125);
    p.gy[2] = (y - 1.5);

    for (let i = 0; i < 3; i += 1) {
      const ga = p.gi + i * gsizeY;
      const pxi = p.px[i];
      const pgxi = p.gx[i];
      for (let j = 0; j < 3; j += 1) {
        const gaj = ga + j;
        let n = grid[gaj];
        if (typeof n === 'undefined') {
          n = new Node();
          grid[gaj] = n;
        }
        const phi = pxi * p.py[j];
        n.m += phi;
        n.gx += pgxi * p.py[j];
        n.gy += pxi * p.gy[j];
      }
    }
  }

  for (let pi = 0; pi < particleCount; pi += 1) {
    const p = particles[pi];
    let density = 0;
    for (let i = 0; i < 3; i += 1) {
      const ga = p.gi + i * gsizeY;
      const pxi = p.px[i];
      for (let j = 0; j < 3; j += 1) {
        const n = grid[ga + j];
        const phi = pxi * p.py[j];
        density += phi * n.m;
      }
    }
    let pressure = (density - window.restDensity) / window.restDensity;
    if (pressure > 4.0) { pressure = 4.0; }

    let fx = 0; let
      fy = 0;
    if (p.x < 2) {
      fx += 2 - p.x;
      p.u *= 0.1;
    } else if (p.x > bx) {
      fx += bx - p.x;
      p.u *= 0.1;
    }
    if (p.y < 2) {
      fy += 2 - p.y;
      p.v *= 0.1;
    } else if (p.y > by) {
      fy += by - p.y;
      p.v *= 0.1;
    }

    for (let i = 0; i < 3; i += 1) {
      const ga = p.gi + i * gsizeY;
      const pxi = p.px[i];
      const gxi = p.gx[i];
      for (let j = 0; j < 3; j += 1) {
        const n = grid[ga + j];
        const phi = pxi * p.py[j];
        n.ax += -((gxi * p.py[j]) * pressure) + fx * phi;
        n.ay += -((pxi * p.gy[j]) * pressure) + fy * phi;
      }
    }
  }

  for (const i in grid) {
    const n = grid[i];
    if (n.m > 0.0) {
      n.ax /= n.m;
      n.ay /= n.m;
      n.ay += window.gravity;
      n.ax += accelX;
      n.ay += accelY;
    }
  }

  for (let pi = 0; pi < particleCount; pi += 1) {
    const p = particles[pi];
    for (let i = 0; i < 3; i += 1) {
      const ga = p.gi + i * gsizeY;
      const pxi = p.px[i];
      for (let j = 0; j < 3; j += 1) {
        const n = grid[ga + j];
        const phi = pxi * p.py[j];
        p.u += phi * n.ax;
        p.v += phi * n.ay;
      }
    }
    for (let i = 0; i < 3; i += 1) {
      const ga = p.gi + i * gsizeY;
      const pxi = p.px[i];
      for (let j = 0; j < 3; j += 1) {
        const n = grid[ga + j];
        const phi = pxi * p.py[j];
        n.u += phi * p.u;
        n.v += phi * p.v;
      }
    }
  }

  for (const i in grid) {
    const n = grid[i];
    if (n.m > 0.0) {
      n.u /= n.m;
      n.v /= n.m;
    }
  }

  minX = particles[0].x;
  minY = particles[0].y;
  maxX = minX;
  maxY = minY;
  for (let pi = 0; pi < particleCount; pi += 1) {
    const p = particles[pi];
    let gu = 0; let
      gv = 0;
    for (let i = 0; i < 3; i += 1) {
      const ga = p.gi + i * gsizeY;
      const pxi = p.px[i];
      for (let j = 0; j < 3; j += 1) {
        const n = grid[ga + j];
        const phi = pxi * p.py[j];
        gu += phi * n.u;
        gv += phi * n.v;
      }
    }
    p.x += gu - wdx;
    p.y += gv - wdy;
    p.u += window.smoothing * (gu - p.u);
    p.v += window.smoothing * (gv - p.v);
    p.gu = gu;
    p.gv = gv;

    if (p.x < minX) {
      minX = p.x;
    } else if (p.x > maxX) {
      maxX = p.x;
    }
    if (p.y < minY) {
      minY = p.y;
    } else if (p.y > maxY) {
      maxY = p.y;
    }
  }

  minX = Math.floor(minX - 1);
  minY = Math.floor(minY - 1);
  maxX = Math.floor(maxX + 3);
  maxY = Math.floor(maxY + 3);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 1;
  ctx.fillStyle = '#000000cc';
  ctx.beginPath();
  for (let i = 0; i < particleCount; i += 1) {
    const p = particles[i];
    const x1 = p.x * window.particleSize;
    const y1 = p.y * window.particleSize;
    const x2 = (p.x - p.gu) * window.particleSize;
    const y2 = (p.y - p.gv) * window.particleSize;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.fillRect(
      x1 - window.particleSize,
      y1 - window.particleSize,
      window.particleSize,
      window.particleSize,
    );
  }
  ctx.stroke();

  window.requestAnimationFrame(() => {
    render();
  });
}

render();
