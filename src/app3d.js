
// ---------- página: liga os palcos 3D à interface
const GS = window.gsap;
const C = window.CLINCH;
const fontsReady = Promise.race([
  Promise.all([
    document.fonts.load('600 150px "Cormorant Garamond"'),
    document.fonts.load('700 150px "Hanken Grotesk"'),
  ]).catch(() => {}),
  new Promise(r => setTimeout(r, 1800)),
]);

function fallback(stageEl) {
  const d = document.createElement('div');
  d.className = 'fallback';
  d.textContent = 'O 3D não carregou neste navegador. Tente abrir a página no Chrome, Safari ou Edge atualizados.';
  stageEl.appendChild(d);
  const h = stageEl.querySelector('.hint'); if (h) h.hidden = true;
}

function tween(target, vars) { if (GS && !REDUCE) return GS.to(target, vars); Object.keys(vars).forEach(k => { if (k in target) target[k] = vars[k]; }); if (vars.onComplete) vars.onComplete(); }

await fontsReady;

// ---------- hero: luva da marca, gira, segue o mouse e dá jab
(() => {
  const el = document.getElementById('heroStage');
  const stage = createStage(document.getElementById('heroCanvas'), { target: [0, 1.42, 0], distance: 8.6, polar: [0.38, 0.5], azimuth: 0.55, autoRotate: 1.5, shadow: [2.8, 2.4] });
  if (!stage) return fallback(el);
  const glove = createGlove({ color: '#a3121c', trim: '#f3efe6', strap: '#a3121c', closure: 'velcro', label: 'SUPPLY', labelSerif: true, labelSize: 140, labelTrack: 46, labelColor: '#d4b06f', mark: 'CLINCH', markColor: '#d4b06f' });
  const tilt = new THREE.Group(), jab = new THREE.Group(), bob = new THREE.Group();
  jab.add(glove.group); bob.add(jab); tilt.add(bob); stage.scene.add(tilt);

  if (GS && !REDUCE) {
    glove.group.rotation.y = -3.2; glove.group.scale.setScalar(0.72); bob.position.y = -0.5;
    GS.to(glove.group.rotation, { y: 0, duration: 1.8, ease: 'power4.out', delay: 0.15 });
    GS.to(glove.group.scale, { x: 1, y: 1, z: 1, duration: 1.6, ease: 'back.out(1.5)', delay: 0.15 });
    GS.to(bob.position, { y: 0, duration: 1.4, ease: 'power3.out', delay: 0.15 });
  }
  let tx = 0, ty = 0, punching = false;
  window.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    tx = ((e.clientY - r.top) / r.height - 0.5) * 0.22;
    ty = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
  }, { passive: true });
  stage.onTick((dt, t) => {
    tilt.rotation.x += (tx - tilt.rotation.x) * 0.05;
    tilt.rotation.z += (-ty * 0.3 - tilt.rotation.z) * 0.05;
    if (!REDUCE && !punching) bob.position.y += (Math.sin(t * 1.3) * 0.05 - bob.position.y) * 0.08;
  });

  const canvas = stage.renderer.domElement;
  let down = null;
  canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  canvas.addEventListener('pointerup', e => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), quick = performance.now() - down.t < 350;
    down = null;
    if (moved < 6 && quick) throwJab(e.clientX, e.clientY);
  });
  function throwJab(x, y) {
    if (!GS || REDUCE || punching) return;
    punching = true;
    const dir = stage.camera.position.clone().sub(stage.controls.target).normalize();
    GS.timeline({ onComplete: () => { punching = false; } })
      .to(jab.position, { x: dir.x * 1.5, y: dir.y * 1.5 + 0.15, z: dir.z * 1.5, duration: 0.1, ease: 'power3.out' })
      .to(jab.rotation, { x: -0.25, duration: 0.1, ease: 'power3.out' }, 0)
      .to(jab.position, { x: 0, y: 0, z: 0, duration: 0.75, ease: 'elastic.out(1, 0.45)' })
      .to(jab.rotation, { x: 0, duration: 0.75, ease: 'elastic.out(1, 0.45)' }, '<');
    GS.fromTo(el, { x: -7 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.3)', delay: 0.08 });
    const ring = document.createElement('span');
    ring.className = 'shock'; ring.style.left = x + 'px'; ring.style.top = y + 'px';
    document.body.appendChild(ring);
    GS.fromTo(ring, { scale: 0.3, opacity: 1 }, { scale: 4, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.06, onComplete: () => ring.remove() });
  }
})();

// ---------- configurador de sapatilhas, com pontos de detalhe
(() => {
  const el = document.getElementById('shoeStage');
  const stage = createStage(document.getElementById('shoeCanvas'), { target: [0, 1.1, 0], distance: 7.7, polar: [0.34, 0.5], azimuth: 0.6, autoRotate: 0.9, shadow: [4, 2.4] });
  if (!stage) return fallback(el);
  const s0 = C.state;
  const shoe = createShoe(s0.model, C.SHOES[s0.model].colors[s0.color]);
  const spin = new THREE.Group(); spin.add(shoe.group); stage.scene.add(spin);

  const HOTS = {
    hyperko: [
      { p: [-0.95, 2.12, 0.34], n: [0, 0.2, 1], t: 'Cano alto, suporte total do tornozelo' },
      { p: [0.05, 1.44, 0.1], n: [0.6, 0.8, 0], t: 'Amarração dupla' },
      { p: [-0.32, 0.82, 0.42], n: [0, 0, 1], t: 'A mais leve que a Nike já fez' },
    ],
    boxhog: [
      { p: [-0.7, 1.35, 0.36], n: [0, 0, 1], t: 'Cabedal em mesh respirável' },
      { p: [0.55, 0.18, 0.52], n: [0, 0, 1], t: 'Entressola EVA para estabilidade' },
      { p: [1.36, 0.1, 0.28], n: [1, 0, 0.5], t: 'Solado com ponto de pivô' },
    ],
    machomai: [
      { p: [0.45, 0.13, 0.52], n: [0, 0, 1], t: 'Sola fina, contato máximo com o solo' },
      { p: [-0.5, 1.05, 0.41], n: [0, 0, 1], t: 'Leve e respirável' },
      { p: [1.22, 0.1, 0.36], n: [0.8, 0, 0.6], t: 'Tração para pivotar sem travar o joelho' },
    ],
  };
  const host = document.getElementById('hots');
  let hots = [];
  function makeHots(model) {
    host.innerHTML = '';
    hots = HOTS[model].map((h, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'hot'; b.id = 'hot-' + model + '-' + i;
      b.innerHTML = '<span class="dot"></span><span class="lbl"></span>';
      b.querySelector('.lbl').textContent = h.t;
      b.setAttribute('aria-label', h.t);
      b.addEventListener('click', () => { const open = !b.classList.contains('open'); hots.forEach(x => x.el.classList.remove('open')); b.classList.toggle('open', open); });
      host.appendChild(b);
      return { el: b, p: new THREE.Vector3(...h.p), n: new THREE.Vector3(...h.n).normalize() };
    });
  }
  makeHots(s0.model);
  const v = new THREE.Vector3(), nw = new THREE.Vector3(), cd = new THREE.Vector3();
  stage.onTick(() => {
    const r = el.getBoundingClientRect();
    hots.forEach(h => {
      v.copy(h.p); spin.localToWorld(v);
      nw.copy(h.n).applyQuaternion(spin.quaternion);
      cd.copy(stage.camera.position).sub(v).normalize();
      const away = nw.dot(cd) < 0.18 || spin.scale.x < 0.98;
      v.project(stage.camera);
      const x = (v.x * 0.5 + 0.5) * r.width, y = (-v.y * 0.5 + 0.5) * r.height;
      h.el.style.transform = 'translate(' + (x - 11).toFixed(1) + 'px,' + (y - 11).toFixed(1) + 'px)';
      h.el.classList.toggle('away', away);
      h.el.classList.toggle('flip', x > r.width * 0.58);
      if (h.el.classList.contains('flip')) h.el.style.transform = 'translate(calc(' + (x + 11).toFixed(1) + 'px - 100%),' + (y - 11).toFixed(1) + 'px)';
    });
  });

  let busy = null;
  document.addEventListener('clinch:shoe', e => {
    const { model, cw, modelChanged } = e.detail;
    if (!modelChanged) { shoe.setColorway(cw); return; }
    if (!GS || REDUCE) { shoe.show(model, cw); makeHots(model); return; }
    if (busy) busy.kill();
    busy = GS.timeline()
      .to(spin.rotation, { y: '+=' + Math.PI, duration: 0.35, ease: 'power2.in' })
      .to(spin.scale, { x: 0.8, y: 0.8, z: 0.8, duration: 0.35, ease: 'power2.in' }, 0)
      .add(() => { shoe.show(model, cw); makeHots(model); })
      .to(spin.rotation, { y: '+=' + Math.PI, duration: 0.7, ease: 'power3.out' })
      .to(spin.scale, { x: 1, y: 1, z: 1, duration: 0.7, ease: 'back.out(1.7)' }, '<');
  });
})();

// ---------- luvas
(() => {
  const el = document.getElementById('gloveStage');
  const stage = createStage(document.getElementById('gloveCanvas'), { target: [0, 1.42, 0], distance: 8.8, polar: [0.36, 0.5], azimuth: 0.9, autoRotate: 1.2, shadow: [2.8, 2.4] });
  if (!stage) return fallback(el);
  const first = C.GLOVES[C.state.glove].look;
  const glove = createGlove({ ...first });
  const spin = new THREE.Group(); spin.add(glove.group); stage.scene.add(spin);
  let busy = null;
  document.addEventListener('clinch:glove', e => {
    const look = C.GLOVES[e.detail.key].look;
    const opts = { closure: look.closure, label: look.label, labelColor: look.labelColor, labelSize: look.labelSize, labelTrack: look.labelTrack };
    if (!GS || REDUCE) { glove.build(opts); glove.setColors(look); return; }
    if (busy) busy.kill();
    busy = GS.timeline()
      .to(spin.rotation, { y: '+=' + Math.PI, duration: 0.3, ease: 'power2.in' })
      .to(spin.position, { y: -0.25, duration: 0.3, ease: 'power2.in' }, 0)
      .add(() => { glove.build(opts); glove.setColors(look); })
      .to(spin.rotation, { y: '+=' + Math.PI, duration: 0.8, ease: 'power3.out' })
      .to(spin.position, { y: 0, duration: 0.8, ease: 'back.out(2)' }, '<');
  });
})();
