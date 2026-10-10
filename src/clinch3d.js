// Clinch Supply 3D: procedural boxing boots and gloves, a turntable stage per canvas.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

function sampler(points) {
  const curve = new THREE.SplineCurve(points.map(p => new THREE.Vector2(p[0], p[1])));
  const pts = curve.getPoints(600);
  return x => {
    if (x <= pts[0].x) return pts[0].y;
    let lo = 0, hi = pts.length - 1;
    if (x >= pts[hi].x) return pts[hi].y;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (pts[m].x < x) lo = m; else hi = m; }
    const a = pts[lo], b = pts[hi], t = (x - a.x) / ((b.x - a.x) || 1);
    return a.y + (b.y - a.y) * t;
  };
}

// ---------- textures (drawn once, shared)
function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (opts.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(opts.repeat[0], opts.repeat[1]); }
  if (opts.flipX) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; }
  if (opts.color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
const TEX = {};
function bumpRibs() {
  return TEX.ribs || (TEX.ribs = canvasTex(64, 64, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#000'); grd.addColorStop(0.5, '#fff'); grd.addColorStop(1, '#000');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  }, { repeat: [1, 46] }));
}
function bumpMesh() {
  return TEX.mesh || (TEX.mesh = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#fff'; g.lineWidth = 6;
    for (let i = -w; i < w * 2; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); }
    g.strokeStyle = '#222'; g.lineWidth = 3;
    for (let i = -w; i < w * 2; i += 16) { g.beginPath(); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke(); }
  }, { repeat: [22, 44] }));
}
function bumpGrain() {
  return TEX.grain || (TEX.grain = canvasTex(256, 256, (g, w, h) => {
    const img = g.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) { const v = 110 + Math.random() * 60; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0);
  }, { repeat: [5, 10] }));
}
function shadowTex() {
  return TEX.shadow || (TEX.shadow = canvasTex(256, 256, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grd.addColorStop(0, 'rgba(0,0,0,0.75)'); grd.addColorStop(0.45, 'rgba(0,0,0,0.35)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  }));
}
function swooshPath(g, w, h) {
  const sx = w / 1000, sy = h / 500;
  g.beginPath();
  g.moveTo(20 * sx, 40 * sy);
  g.bezierCurveTo(340 * sx, 300 * sy, 680 * sx, 470 * sy, 860 * sx, 455 * sy);
  g.bezierCurveTo(990 * sx, 445 * sy, 985 * sx, 330 * sy, 880 * sx, 318 * sy);
  g.bezierCurveTo(820 * sx, 330 * sy, 760 * sx, 345 * sy, 700 * sx, 345 * sy);
  g.bezierCurveTo(470 * sx, 330 * sy, 240 * sx, 210 * sy, 20 * sx, 40 * sy);
  g.closePath();
}
function logoTex(kind, flip) {
  const key = kind + (flip ? '-f' : '');
  if (TEX[key]) return TEX[key];
  return (TEX[key] = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = '#fff'; g.strokeStyle = '#fff';
    if (kind === 'swoosh') { swooshPath(g, w, h); g.fill(); }
    else if (kind === 'swoosh-outline') { swooshPath(g, w, h); g.lineWidth = 26; g.lineJoin = 'round'; g.stroke(); }
    else if (kind === 'stripes') {
      for (let i = 0; i < 3; i++) {
        const x0 = 250 + i * 150;
        g.beginPath();
        g.moveTo(x0, 500); g.lineTo(x0 + 86, 500); g.lineTo(x0 + 86 + 250, 0); g.lineTo(x0 + 250, 0); g.closePath(); g.fill();
      }
    }
  }, { flipX: flip, color: true }));
}
function textTex(text, opts = {}) {
  const key = 'txt-' + text + (opts.serif ? 's' : '');
  if (TEX[key]) return TEX[key];
  return (TEX[key] = canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const size = opts.size || 150;
    g.font = (opts.serif ? '600 ' : '700 ') + size + 'px ' + (opts.serif ? '"Cormorant Garamond", Georgia, serif' : '"Hanken Grotesk", Arial, sans-serif');
    if ('letterSpacing' in g) g.letterSpacing = (opts.track || 0) + 'px';
    g.fillText(text, w / 2, h / 2 + 6);
  }, { color: true }));
}

// ---------- materials
function leather(color) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.32, bumpMap: bumpGrain(), bumpScale: 0.6 });
}
function decalMat(tex, color) {
  return new THREE.MeshStandardMaterial({ map: tex, color, transparent: true, roughness: 0.45, metalness: 0.0, polygonOffset: true, polygonOffsetFactor: -6, depthWrite: false });
}

// ---------- loft (superellipse sections along x)
function loft({ xmin, xmax, NU = 150, NV = 80, ys, yt, half, nTop, nBot, heelR, toeR }) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= NU; i++) {
    const u = i / NU, x = lerp(xmin, xmax, u);
    const h = clamp((x - xmin) / heelR, 0, 1), t = clamp((xmax - x) / toeR, 0, 1);
    const fh = Math.sqrt(1 - (1 - h) * (1 - h)), ft = Math.sqrt(1 - (1 - t) * (1 - t));
    const y0 = ys(x), y1 = y0 + (yt(x) - y0) * Math.pow(ft, 0.55);
    const yc = (y0 + y1) / 2, b = (y1 - y0) / 2;
    const nt = nTop(x), nb = nBot(x);
    for (let j = 0; j <= NV; j++) {
      const th = -Math.PI / 2 + (j / NV) * Math.PI * 2;
      const c = Math.cos(th), s = Math.sin(th);
      const n = s > 0 ? nt : nb;
      const zc = Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
      const y = yc + b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
      pos.push(x, y, half(x, y) * fh * ft * zc);
      uv.push(u, j / NV);
    }
  }
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
    const a = i * (NV + 1) + j, b = a + NV + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function tubeAlong(points, radius, closed = false, seg = 120) {
  const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal');
  return new THREE.TubeGeometry(curve, seg, radius, 10, closed);
}
function ellipsePts(cx, cy, cz, rx, rz, n = 64) {
  const out = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; out.push(new THREE.Vector3(cx + Math.cos(a) * rx, cy, cz + Math.sin(a) * rz)); }
  return out;
}

// ---------- boots
export const SHOE_MODELS = {
  hyperko: { collar: 2.5, texture: 'ribs', logo: 'swoosh', logoBox: [-0.12, 0.92, 1.95, 0.98] },
  boxhog: { collar: 2.36, texture: 'mesh', logo: 'stripes', logoBox: [0.02, 0.8, 1.45, 1.12] },
  machomai: { collar: 1.78, texture: 'grain', logo: 'swoosh', logoBox: [-0.02, 0.78, 1.8, 0.9] },
};

function shoeShape(C) {
  const ys = () => 0.2;
  const yt = sampler([
    [-1.42, C], [-1.0, C], [-0.5, C - 0.01], [-0.38, C - 0.1],
    [-0.24, lerp(C, 1.45, 0.42)], [0.0, 1.45 + (C - 2.45) * 0.25],
    [0.3, 1.1], [0.62, 0.9], [0.95, 0.74], [1.25, 0.6], [1.46, 0.45],
  ]);
  const W = sampler([[-1.42, 0.35], [-1.1, 0.375], [-0.6, 0.37], [0.0, 0.405], [0.6, 0.455], [1.0, 0.43], [1.46, 0.36]]);
  const half = (x, y) => W(x) * (1 - 0.17 * smooth(0.9, 2.0, y));
  const nTop = x => 2.3 + 5.2 * (1 - smooth(-0.62, -0.32, x));
  return { xmin: -1.42, xmax: 1.46, ys, yt, half, W, nTop, nBot: () => 5, heelR: 0.34, toeR: 0.56 };
}

export function createShoe(modelKey, cw) {
  const group = new THREE.Group();
  const mats = {
    upper: new THREE.MeshPhysicalMaterial({ color: cw.upper, roughness: 0.55, sheen: 0.22, sheenRoughness: 0.6, sheenColor: new THREE.Color('#ffffff'), bumpScale: 1 }),
    sole: new THREE.MeshStandardMaterial({ color: cw.sole, roughness: 0.75 }),
    lace: new THREE.MeshStandardMaterial({ color: cw.lace || cw.upper, roughness: 0.6 }),
    trim: new THREE.MeshStandardMaterial({ color: cw.trim || cw.upper, roughness: 0.5 }),
    lining: new THREE.MeshStandardMaterial({ color: '#0c0c0c', roughness: 0.9 }),
    logo: null, logoB: null,
  };
  let parts = [];
  let current = null;

  function build(key) {
    parts.forEach(p => { p.geometry.dispose(); group.remove(p); });
    parts = [];
    const M = SHOE_MODELS[key];
    const S = shoeShape(M.collar);
    const C = M.collar;
    const add = (geo, mat) => { const m = new THREE.Mesh(geo, mat); group.add(m); parts.push(m); return m; };

    mats.upper.bumpMap = M.texture === 'ribs' ? bumpRibs() : M.texture === 'mesh' ? bumpMesh() : bumpGrain();
    mats.upper.bumpScale = M.texture === 'ribs' ? 1.1 : M.texture === 'mesh' ? 0.5 : 0.6;
    mats.upper.needsUpdate = true;

    const ug = loft(S);
    const up = ug.attributes.position;
    for (let i = 0; i < up.count; i++) {
      const x = up.getX(i), y = up.getY(i), w = 1 - smooth(-1.42, -0.85, x);
      up.setX(i, x + w * (0.11 * smooth(0.7, 1.45, y) - 0.05 * smooth(1.8, 2.5, y)));
    }
    ug.computeVertexNormals();
    const upper = add(ug, mats.upper);
    add(loft({ ...S, xmin: -1.47, xmax: 1.52, ys: () => 0, yt: () => 0.27, half: (x) => S.W(x) * 1.08 + 0.012, nTop: () => 6, nBot: () => 9, heelR: 0.3, toeR: 0.48, NV: 48 }), mats.sole);

    // collar ring + opening
    const cx = -0.9, rz = S.half(cx, C) * 0.94, rx = 0.5;
    add(tubeAlong(ellipsePts(cx, C + 0.02, 0, rx, rz), 0.085, true), mats.trim);
    const disc = new THREE.Shape(); disc.absellipse(0, 0, rx - 0.04, rz - 0.04, 0, Math.PI * 2);
    const dg = new THREE.ShapeGeometry(disc, 48); dg.rotateX(-Math.PI / 2); dg.translate(cx, C + 0.012, 0);
    add(dg, mats.lining);

    // lace line, sampled by arc length
    const yAt = x => S.yt(x);
    const line = []; for (let i = 0; i <= 200; i++) { const x = lerp(0.52, -0.37, i / 200); line.push(new THREE.Vector2(x, yAt(x))); }
    const lens = [0]; for (let i = 1; i < line.length; i++) lens.push(lens[i - 1] + line[i].distanceTo(line[i - 1]));
    const total = lens[lens.length - 1];
    const rows = M.collar > 2 ? 9 : 7;
    const eyeL = [], eyeR = [];
    for (let r = 0; r < rows; r++) {
      const target = (r + 0.5) / rows * total;
      let k = lens.findIndex(l => l >= target); k = Math.max(1, k);
      const p = line[k], q = line[k - 1];
      const tan = new THREE.Vector2(p.x - q.x, p.y - q.y).normalize();
      const nrm = new THREE.Vector3(tan.y, -tan.x, 0); if (nrm.y < 0) nrm.negate();
      const a = S.half(p.x, p.y);
      const base = new THREE.Vector3(p.x, p.y, 0).addScaledVector(nrm, 0.03);
      for (const sgn of [1, -1]) {
        const g = new THREE.CylinderGeometry(0.021, 0.021, a * 0.72, 8); g.rotateX(Math.PI / 2);
        const m = add(g, mats.lace);
        m.position.copy(base);
        m.quaternion.setFromAxisAngle(nrm, sgn * 0.34);
      }
      const n = 2.3, q2 = 0.42, b = (p.y - 0.2) / 2;
      const ySurf = (0.2 + b) + b * Math.pow(1 - Math.pow(q2, n), 1 / n);
      const dy = ySurf - p.y;
      eyeL.push(new THREE.Vector3(p.x, p.y + dy + 0.012, a * q2));
      eyeR.push(new THREE.Vector3(p.x, p.y + dy + 0.012, -a * q2));
    }
    if (eyeL.length > 2) { add(tubeAlong(eyeL, 0.03), mats.trim); add(tubeAlong(eyeR, 0.03), mats.trim); }

    // heel pull tab
    const tab = add(new THREE.BoxGeometry(0.06, 0.34, 0.16), mats.trim);
    tab.position.set(-1.38, C - 0.08, 0);

    // logo decals on both sides
    upper.updateMatrixWorld(true);
    const [lx, ly, lw, lh] = M.logoBox;
    const kind = M.logo === 'swoosh' && cw.logoStyle === 'outline' ? 'swoosh-outline' : M.logo;
    if (!mats.logo) { mats.logo = decalMat(logoTex(kind, false), cw.logo); mats.logoB = decalMat(logoTex(kind, true), cw.logo); }
    mats.logo.map = logoTex(kind, false); mats.logoB.map = logoTex(kind, true);
    mats.logo.needsUpdate = mats.logoB.needsUpdate = true;
    const saved = group.matrixWorld.clone();
    group.matrixWorld.identity(); upper.matrixWorld.identity();
    add(new DecalGeometry(upper, new THREE.Vector3(lx, ly, 0.6), new THREE.Euler(0, 0, 0), new THREE.Vector3(lw, lh, 0.7)), mats.logo);
    add(new DecalGeometry(upper, new THREE.Vector3(lx, ly, -0.6), new THREE.Euler(0, Math.PI, 0), new THREE.Vector3(lw, lh, 0.7)), mats.logoB);
    group.matrixWorld.copy(saved);
    current = key;
  }

  function paint(c, animate) {
    const to = { upper: c.upper, sole: c.sole, lace: c.lace || c.upper, trim: c.trim || c.upper, logo: c.logo };
    for (const k of Object.keys(to)) {
      const targets = k === 'logo' ? [mats.logo, mats.logoB] : [mats[k]];
      targets.forEach(m => {
        if (!m) return;
        const col = new THREE.Color(to[k]);
        if (!animate || REDUCE) { m.color.copy(col); return; }
        const from = m.color.clone(); const t0 = performance.now();
        const step = now => { const t = Math.min(1, (now - t0) / 420); m.color.copy(from).lerp(col, t * t * (3 - 2 * t)); if (t < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      });
    }
  }
  function setColorway(c, animate = true) {
    const needRebuild = SHOE_MODELS[current].logo === 'swoosh' && (c.logoStyle === 'outline') !== (cw.logoStyle === 'outline');
    cw = c;
    if (needRebuild) build(current);
    paint(c, animate);
  }
  function show(key, c) { cw = c; build(key); paint(c, false); }

  build(modelKey);
  return { group, build, show, setColorway, get model() { return current; } };
}

// ---------- glove
function loftY({ y0, y1, NU = 120, NV = 96, hx, hz, cz, n = () => 2.2, topR = 0.32, open = true }) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= NU; i++) {
    const v = i / NU, y = lerp(y0, y1, v);
    const tt = clamp((y1 - y) / topR, 0, 1), f = topR > 0 ? Math.sqrt(1 - (1 - tt) * (1 - tt)) : 1;
    const ex = n(y);
    for (let j = 0; j <= NV; j++) {
      const th = (j / NV) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
      const x = hx(y) * f * Math.sign(c) * Math.pow(Math.abs(c), 2 / ex);
      const z = cz(y) + hz(y) * f * Math.sign(s) * Math.pow(Math.abs(s), 2 / ex);
      pos.push(x, y, z); uv.push(j / NV, v);
    }
  }
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
    const a = i * (NV + 1) + j, b = a + NV + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}

const GLOVE = (() => {
  const H = 2.95;
  const hx = sampler([[0, 0.62], [0.9, 0.62], [1.15, 0.67], [1.5, 0.8], [1.9, 0.88], [2.25, 0.9], [2.6, 0.84], [H, 0.62]]);
  const hz = sampler([[0, 0.52], [0.9, 0.52], [1.15, 0.58], [1.5, 0.76], [1.95, 0.86], [2.35, 0.84], [2.7, 0.72], [H, 0.6]]);
  const cz = sampler([[0, 0], [0.95, 0], [1.4, -0.08], [1.9, -0.16], [2.4, -0.2], [H, -0.2]]);
  return { H, hx, hz, cz, topR: 0.62 };
})();

export function createGlove(o) {
  const group = new THREE.Group();
  const mats = {
    body: leather(o.color),
    trim: new THREE.MeshStandardMaterial({ color: o.trim, roughness: 0.5 }),
    strap: leather(o.strap || o.color),
    lace: new THREE.MeshStandardMaterial({ color: o.lace || o.trim, roughness: 0.6 }),
    dark: new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.9 }),
    label: null, mark: null,
  };
  let parts = [];
  const G = GLOVE;
  const capF = y => { const tt = clamp((G.H - y) / G.topR, 0, 1); return Math.sqrt(1 - (1 - tt) * (1 - tt)); };

  function build(opt) {
    o = { ...o, ...opt };
    parts.forEach(p => { p.geometry.dispose(); group.remove(p); });
    parts = [];
    const add = (geo, mat) => { const m = new THREE.Mesh(geo, mat); group.add(m); parts.push(m); return m; };
    const body = add(loftY({ y0: 0, y1: G.H, hx: G.hx, hz: G.hz, cz: G.cz, topR: G.topR }), mats.body);

    // thumb, pressed against the front-side of the fist
    const thumbG = new THREE.CapsuleGeometry(0.29, 0.62, 16, 32);
    thumbG.scale(0.78, 1, 1);
    const thumb = add(thumbG, mats.body);
    thumb.position.set(0.56, 1.72, -0.68); thumb.rotation.set(0.16, 0, 0.16);

    // welt piping around the side seam
    const seam = [];
    for (let k = 0; k <= 60; k++) { const y = lerp(1.05, G.H - 0.002, k / 60); seam.push(new THREE.Vector3(G.hx(y) * capF(y) + 0.012, y, G.cz(y))); }
    const seamPts = [...seam, ...seam.slice(0, -1).reverse().map(p => new THREE.Vector3(-p.x, p.y, p.z))];
    add(tubeAlong(seamPts, 0.018, false, 200), mats.trim);

    // cuff bottom piping and opening
    add(tubeAlong(ellipsePts(0, 0.035, 0, 0.635, 0.535), 0.034, true), mats.trim);
    const bottom = new THREE.CircleGeometry(1, 48); bottom.rotateX(Math.PI / 2); bottom.scale(0.6, 1, 0.5); bottom.translate(0, 0.004, 0);
    add(bottom, mats.dark);

    let labelTarget = body, labelY = 0.6;
    if (o.closure === 'lace') {
      const slit = add(new THREE.BoxGeometry(0.1, 0.84, 0.012), mats.dark);
      slit.position.set(0, 0.56, -0.524);
      for (let r = 0; r < 6; r++) {
        const y = 0.2 + r * 0.14;
        for (const sg of [1, -1]) {
          const g = new THREE.CylinderGeometry(0.02, 0.02, 0.34, 8); g.rotateZ(Math.PI / 2);
          const m = add(g, mats.lace); m.position.set(0, y + 0.03, -0.54); m.rotation.z = sg * 0.42;
        }
      }
    } else {
      const strap = add(loftY({ y0: 0.2, y1: 0.76, NU: 8, hx: () => 0.648, hz: () => 0.548, cz: () => 0, topR: 0 }), mats.strap);
      labelTarget = strap; labelY = 0.48;
      add(tubeAlong(ellipsePts(0, 0.215, 0, 0.652, 0.552), 0.016, true), mats.trim);
      add(tubeAlong(ellipsePts(0, 0.745, 0, 0.652, 0.552), 0.016, true), mats.trim);
    }

    group.updateMatrixWorld(true);
    const saved = group.matrixWorld.clone(); group.matrixWorld.identity();
    group.children.forEach(c => c.updateMatrixWorld(true));
    if (o.label) {
      const tex = textTex(o.label, { serif: o.labelSerif, size: o.labelSize, track: o.labelTrack });
      if (!mats.label) mats.label = decalMat(tex, o.labelColor);
      mats.label.map = tex; mats.label.color.set(o.labelColor); mats.label.needsUpdate = true;
      add(new DecalGeometry(labelTarget, new THREE.Vector3(0, labelY, 0.6), new THREE.Euler(0, 0, 0), new THREE.Vector3(1.0, 0.25, 0.4)), mats.label);
    }
    if (o.mark) {
      if (!mats.mark) mats.mark = decalMat(textTex(o.mark, { serif: true, size: 170, track: 34 }), o.markColor);
      add(new DecalGeometry(body, new THREE.Vector3(0, 2.0, 0.9), new THREE.Euler(-0.18, 0, 0), new THREE.Vector3(1.3, 0.33, 0.7)), mats.mark);
    }
    group.matrixWorld.copy(saved);
  }

  function setColors(c) {
    const pairs = [[mats.body, c.color], [mats.strap, c.strap || c.color], [mats.trim, c.trim], [mats.lace, c.lace || c.trim]];
    if (mats.label && c.labelColor) pairs.push([mats.label, c.labelColor]);
    pairs.forEach(([m, hex]) => {
      const col = new THREE.Color(hex);
      if (REDUCE) { m.color.copy(col); return; }
      const from = m.color.clone(); const t0 = performance.now();
      const step = now => { const t = Math.min(1, (now - t0) / 420); m.color.copy(from).lerp(col, t * t * (3 - 2 * t)); if (t < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }

  build({});
  return { group, build, setColors };
}

// ---------- stage
export function createStage(canvas, { target = [0, 1.2, 0], distance = 7.5, fov = 30, polar = [0.32, 0.5], azimuth = 0.6, autoRotate = 1.1, shadow = [3.4, 2] } = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environmentIntensity = 0.85;
  const key = new THREE.DirectionalLight('#fff4e4', 1.6); key.position.set(3, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight('#d9b37a', 2.4); rim.position.set(-5, 3, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight('#ffffff', 0.35); fill.position.set(-4, 1, 5); scene.add(fill);

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  const t = new THREE.Vector3(...target);
  const pol = lerp(polar[0], polar[1], 0.5) * Math.PI;
  camera.position.set(t.x + distance * Math.sin(pol) * Math.sin(azimuth), t.y + distance * Math.cos(pol), t.z + distance * Math.sin(pol) * Math.cos(azimuth));
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(t);
  controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minPolarAngle = polar[0] * Math.PI; controls.maxPolarAngle = polar[1] * Math.PI;
  controls.autoRotate = !REDUCE && autoRotate > 0; controls.autoRotateSpeed = autoRotate;
  controls.rotateSpeed = 0.8;
  canvas.style.touchAction = 'pan-y';
  controls.update();

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(shadow[0], shadow[1]), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0.002; scene.add(floor);

  const ticks = [];
  let visible = true, idleTimer = 0;
  controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(idleTimer); });
  controls.addEventListener('end', () => { clearTimeout(idleTimer); idleTimer = setTimeout(() => { controls.autoRotate = !REDUCE && autoRotate > 0; }, 2600); });

  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '120px' }).observe(canvas);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible) return;
    ticks.forEach(f => f(dt, clock.elapsedTime));
    controls.update();
    renderer.render(scene, camera);
  });
  return { scene, camera, controls, renderer, floor, onTick: f => ticks.push(f), resize };
}
