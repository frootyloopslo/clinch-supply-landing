(function () {
  var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var G = window.gsap;
  if (G && window.ScrollTrigger) G.registerPlugin(window.ScrollTrigger);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var SHOES = {
    hyperko: {
      brand: 'Nike, topo de linha', name: 'HyperKO 3', price: 1900,
      desc: 'A sapatilha mais leve que a Nike já produziu. Cano alto com suporte total de tornozelo e sistema de amarração dupla para máxima estabilidade no ringue.',
      colors: [
        { name: 'Preta', upper: '#161616', sole: '#121212', logo: '#f4f4f4', logoStyle: 'outline', lace: '#f2f2f2', trim: '#1c1c1c' },
        { name: 'Branca', upper: '#eeeeee', sole: '#1b1b1b', logo: '#151515', logoStyle: 'outline', lace: '#f7f7f7', trim: '#eeeeee' },
        { name: 'Branca e dourada', upper: '#f1efe9', sole: '#c9a14a', logo: '#c9a14a', lace: '#f6f6f6', trim: '#f1efe9' },
        { name: 'Preta e vermelha', upper: '#141414', sole: '#c8202b', logo: '#d42a33', lace: '#151515', trim: '#c8202b' },
        { name: 'Azul edição especial', upper: '#4f8fe0', sole: '#7fb6f0', logo: '#f2d40c', lace: '#e9f2fb', trim: '#2f63c9' },
        { name: 'Preta e rosa', upper: '#161616', sole: '#f0a9d6', logo: '#f0a9d6', lace: '#161616', trim: '#f0a9d6' }
      ]
    },
    boxhog: {
      brand: 'Adidas, melhor custo-benefício', name: 'Box Hog 4', price: 1500,
      desc: 'Cabedal em mesh respirável com reforços internos. Entressola EVA para estabilidade e solado multidirecional com ponto de pivô para footwork rápido.',
      colors: [
        { name: 'Preta', upper: '#171717', sole: '#141414', logo: '#f2f2f2', lace: '#171717', trim: '#171717' },
        { name: 'Azul royal', upper: '#2343a8', sole: '#203c97', logo: '#f4f4f4', lace: '#2343a8', trim: '#2343a8' },
        { name: 'Vermelha', upper: '#ea2a52', sole: '#e2264c', logo: '#f8c9d3', lace: '#ea2a52', trim: '#ea2a52' }
      ]
    },
    machomai: {
      brand: 'Nike, a mais versátil', name: 'Machomai 3', price: 1100,
      desc: 'Sola fina para máximo contato com o solo. Leve, respirável e com tração equilibrada para pivotar sem travar o joelho.',
      colors: [
        { name: 'Preta', upper: '#151515', sole: '#1d1d1d', logo: '#f4f4f4', lace: '#151515', trim: '#151515' },
        { name: 'Branca', upper: '#efefef', sole: '#1a1a1a', logo: '#141414', lace: '#efefef', trim: '#efefef' },
        { name: 'Branca e dourada', upper: '#f2f0ea', sole: '#ece6d8', logo: '#c9a14a', lace: '#f2f0ea', trim: '#f2f0ea' },
        { name: 'Azul royal', upper: '#1f4fc4', sole: '#f2f2f2', logo: '#f4f4f4', lace: '#f4f4f4', trim: '#1f4fc4' },
        { name: 'Vermelha', upper: '#d61f27', sole: '#161616', logo: '#141414', lace: '#d61f27', trim: '#d61f27' }
      ]
    }
  };
  var GLOVES = {
    'cleto-velcro': { name: 'Cleto Reyes Traditional Training, velcro', price: 2400, look: { color: '#9e0f18', trim: '#f3efe6', strap: '#9e0f18', closure: 'velcro', label: 'CLETO REYES', labelColor: '#f3efe6' } },
    'cleto-lace': { name: 'Cleto Reyes Traditional Training, cadarço', price: 2250, look: { color: '#151515', trim: '#f3efe6', lace: '#f3efe6', closure: 'lace', label: 'CLETO REYES', labelColor: '#f3efe6' } },
    'rival-rs1': { name: 'Rival RS1 Ultra Sparring 2.0', price: 2100, look: { color: '#ece7de', trim: '#141414', lace: '#141414', closure: 'lace', label: 'RIVAL', labelColor: '#141414', labelSize: 170, labelTrack: 24 } },
    'rival-rs2v': { name: 'Rival RS2V Super Sparring 2.0', price: 1900, look: { color: '#1c2942', trim: '#ece7de', strap: '#1c2942', closure: 'velcro', label: 'RIVAL', labelColor: '#ece7de', labelSize: 170, labelTrack: 24 } },
    'rival-rb10': { name: 'Rival RB10 Intelli-Shock Bag', price: 2250, look: { color: '#1a1a1a', trim: '#b3121b', strap: '#b3121b', closure: 'velcro', label: 'RIVAL', labelColor: '#f3efe6', labelSize: 170, labelTrack: 24 } }
  };
  var state = { model: 'hyperko', color: 0, glove: 'cleto-velcro' };
  window.CLINCH = { SHOES: SHOES, GLOVES: GLOVES, state: state };
  var emit = function (name, detail) { document.dispatchEvent(new CustomEvent(name, { detail: detail })); };

  var fmt = function (n) { return n.toLocaleString('pt-BR'); };
  function roll(el, to) {
    var from = +(el.dataset.v || to); el.dataset.v = to;
    if (!G || REDUCE || from === to) { el.textContent = fmt(to); return; }
    var o = { v: from };
    G.to(o, { v: to, duration: 0.8, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(Math.round(o.v / 50) * 50); }, onComplete: function () { el.textContent = fmt(to); } });
  }
  function swap(els) {
    if (!G || REDUCE) return;
    G.fromTo(els, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.05, overwrite: true });
  }

  // ---------- configurador
  var tabs = $$('.tab');
  var sw = $('#swatches');
  function renderSwatches() {
    var m = SHOES[state.model];
    sw.innerHTML = '';
    m.colors.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sw'; b.id = 'sw-' + state.model + '-' + i;
      b.setAttribute('aria-pressed', i === state.color ? 'true' : 'false');
      b.setAttribute('aria-label', c.name);
      b.title = c.name;
      b.innerHTML = '<span style="--u:' + c.upper + ';--s:' + c.sole + ';--l:' + c.logo + '"></span>';
      b.addEventListener('click', function () { setColor(i); });
      sw.appendChild(b);
    });
    $('#pColor').textContent = m.colors[state.color].name;
  }
  function setColor(i) {
    if (i === state.color) return;
    state.color = i;
    $$('.sw', sw).forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    $('#pColor').textContent = SHOES[state.model].colors[i].name;
    emit('clinch:shoe', { model: state.model, cw: SHOES[state.model].colors[i], modelChanged: false });
  }
  function setModel(key) {
    if (key === state.model) return;
    state.model = key; state.color = 0;
    var m = SHOES[key];
    tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.model === key ? 'true' : 'false'); });
    $('#pBrand').textContent = m.brand; $('#pName').textContent = m.name; $('#pDesc').textContent = m.desc;
    roll($('#pPrice'), m.price);
    renderSwatches();
    swap(['#pBrand', '#pName', '#pDesc', '#swatches']);
    emit('clinch:shoe', { model: key, cw: m.colors[0], modelChanged: true });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { setModel(t.dataset.model); });
    t.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(t);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); setModel(n.dataset.model); }
    });
  });
  $('#pPrice').dataset.v = 1900;
  renderSwatches();

  // ---------- luvas
  var gls = $$('.gl');
  function setGlove(key) {
    if (key === state.glove) return;
    state.glove = key;
    gls.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.glove === key ? 'true' : 'false'); });
    $('#gName').textContent = GLOVES[key].name;
    roll($('#gPrice'), GLOVES[key].price);
    swap(['#gName']);
    emit('clinch:glove', { key: key });
  }
  $('#gPrice').dataset.v = 2400;
  gls.forEach(function (b) { b.addEventListener('click', function () { setGlove(b.dataset.glove); }); });

  // ---------- Cleto ou Rival
  var corners = $$('.corner');
  var VERDICT = {
    cleto: { html: '<strong>Cleto Reyes</strong> é para quem bate em saco e manopla quase todo dia e quer sentir o golpe entrar.', cta: 'Ver luvas Cleto Reyes', glove: 'cleto-velcro' },
    rival: { html: '<strong>Rival</strong> é para quem faz muito sparring e quer proteger a própria mão e o parceiro.', cta: 'Ver luvas Rival', glove: 'rival-rs1' }
  };
  corners.forEach(function (c) {
    c.addEventListener('click', function () {
      var side = c.dataset.side;
      corners.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      $('#tape').dataset.side = side;
      $('#verdict').innerHTML = VERDICT[side].html;
      var cta = $('#verdictCta'); cta.textContent = VERDICT[side].cta; cta.dataset.glove = VERDICT[side].glove;
      swap(['#verdict']);
      if (G && !REDUCE) G.fromTo('#tape .row', { x: side === 'cleto' ? -10 : 10 }, { x: 0, duration: 0.5, ease: 'power3.out', stagger: 0.04 });
    });
  });
  $('#verdictCta').addEventListener('click', function () { setGlove(this.dataset.glove); });

  // ---------- guia de onças
  var peso = $('#peso'), uso = 'sparring';
  var OZ = [8, 10, 12, 14, 16];
  function recommend(kg, u) {
    if (u === 'luta') return kg <= 66.7 ? [8, 'Luvas de luta oficiais até o meio-médio (66,7 kg) costumam ser de 8 oz. Confirme com o regulamento do evento.'] : [10, 'Acima de 66,7 kg as luvas de luta passam a 10 oz na maioria das federações. Confirme com o regulamento do evento.'];
    if (u === 'saco') return kg < 60 ? [10, 'Leve e rápida para saco e manopla. Boa para trabalhar velocidade e combinação.'] : kg < 80 ? [12, 'Equilíbrio entre velocidade e proteção para o trabalho de saco diário.'] : [14, 'Mais acolchoamento para quem bate pesado no saco todos os dias.'];
    return kg < 57 ? [12, 'Para sparring abaixo de 57 kg, 12 oz já protege bem sem pesar no braço.'] : kg < 70 ? [14, 'Faixa intermediária de sparring. Muitas academias aceitam 14 oz até 70 kg.'] : [16, 'Padrão para sparring acima de 70 kg. Mais proteção para você e para o parceiro.'];
  }
  var ozEl = $('#ozOut');
  function calc() {
    var kg = +peso.value; $('#pesoOut').textContent = kg + ' kg';
    var r = recommend(kg, uso);
    $('#ozNote').textContent = r[1];
    var cur = +ozEl.textContent;
    if (cur !== r[0]) {
      if (G && !REDUCE) { var o = { v: cur }; G.to(o, { v: r[0], duration: 0.5, ease: 'power2.out', onUpdate: function () { ozEl.textContent = Math.round(o.v); } }); G.fromTo(ozEl, { scale: 1.12 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }); }
      else ozEl.textContent = r[0];
    }
    $('#ozFill').style.width = ((OZ.indexOf(r[0]) + 0.5) / 5 * 100) + '%';
  }
  var seg = $('#seg'), pill = $('.pill', seg), segBtns = $$('button', seg);
  function placePill() { var b = segBtns.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; })[0]; pill.style.width = b.offsetWidth + 'px'; pill.style.transform = 'translateX(' + (b.offsetLeft - 5) + 'px)'; }
  segBtns.forEach(function (b) { b.addEventListener('click', function () { uso = b.dataset.uso; segBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); placePill(); calc(); }); });
  peso.addEventListener('input', calc);
  window.addEventListener('resize', placePill);
  placePill(); calc();

  // ---------- nav
  var nav = $('#nav');
  var onScroll = function () { nav.classList.toggle('solid', window.scrollY > 30); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---------- cursor de arrastar
  if (FINE) {
    var cur = $('#cursor');
    var cx = G ? G.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' }) : function (v) { cur.style.left = v + 'px'; };
    var cy = G ? G.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' }) : function (v) { cur.style.top = v + 'px'; };
    window.addEventListener('pointermove', function (e) {
      cx(e.clientX); cy(e.clientY);
      var over = e.target.closest && e.target.closest('[data-cursor]');
      var onHot = e.target.closest && e.target.closest('.hot');
      cur.classList.toggle('on', !!over && !onHot);
    }, { passive: true });
    window.addEventListener('pointerdown', function () { cur.classList.add('down'); });
    window.addEventListener('pointerup', function () { cur.classList.remove('down'); });
  }

  // ---------- botões magnéticos
  if (FINE && G && !REDUCE) {
    $$('.magnet').forEach(function (b) {
      var qx = G.quickTo(b, 'x', { duration: 0.4, ease: 'power3' }), qy = G.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.28); qy((e.clientY - r.top - r.height / 2) * 0.35); });
      b.addEventListener('pointerleave', function () { qx(0); qy(0); });
    });
  }

  if (!G || REDUCE) return;

  // ---------- abertura
  var tl = G.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('#navMark b', { letterSpacing: '0.05em', duration: 1.4 }, 0)
    .from('.hero h1 .ln > span', { yPercent: 105, duration: 1.1, stagger: 0.09 }, 0.1)
    .from(['.hero .chip', '.hero .lede', '.hero .ctas'], { y: 18, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.45)
    .from('#heroStage .glow', { scale: 0.6, opacity: 0, duration: 1.4 }, 0.1);

  // ---------- marcas reagem à velocidade do scroll
  var mq = G.to('#marquee', { xPercent: -25, duration: 24, ease: 'none', repeat: -1 });
  var dir = 1, settle;
  ScrollTrigger.create({
    onUpdate: function (self) {
      var v = self.getVelocity();
      dir = v < 0 ? -1 : 1;
      var boost = Math.min(5, Math.abs(v) / 350);
      G.to(mq, { timeScale: dir * (1 + boost), duration: 0.2, overwrite: true });
      G.to('#marquee', { skewX: Math.max(-10, Math.min(10, -v / 320)), duration: 0.2, overwrite: true });
      clearTimeout(settle);
      settle = setTimeout(function () { G.to(mq, { timeScale: dir, duration: 1.2 }); G.to('#marquee', { skewX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }); }, 120);
    }
  });

  // ---------- palcos crescem ao entrar
  ['#shoeStage', '#gloveStage'].forEach(function (s) {
    G.fromTo(s, { scale: 0.94 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: s, start: 'top 95%', end: 'top 45%', scrub: true } });
  });

  // ---------- fechamento: a marca abre conforme você chega
  G.fromTo('#closerMark', { '--track': '0.06em' }, { '--track': '0.42em', ease: 'none', scrollTrigger: { trigger: '#closer', start: 'top 90%', end: 'center 60%', scrub: true } });
  G.fromTo('#closerRule', { scaleX: 0.15 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#closer', start: 'top 85%', end: 'center 60%', scrub: true } });
})();
