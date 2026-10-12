(function () {
  'use strict';

  // ---------- contato da loja
  // Quando a loja passar o WhatsApp, coloque só os números com DDI e DDD (ex.: '5511999998888').
  // Com o número preenchido, todos os botões abrem o WhatsApp com a mensagem pronta.
  var CONTATO = { whatsapp: '', instagram: 'https://www.instagram.com/clinchsupply/' };
  var FOTOS = 'fotos/';

  // ---------- catálogo
  var SHOES = [
    { key: 'hyperko', brand: 'Nike Boxing', name: 'HyperKO 3', ghost: 'HYPERKO', price: 1900,
      desc: 'A sapatilha mais leve que a Nike já produziu. Cano alto com suporte total de tornozelo e sistema de amarração dupla para máxima estabilidade no ringue.',
      colors: [['preta', 'Preta'], ['branca', 'Branca'], ['branca-dourada', 'Branca e dourada'], ['preta-vermelha', 'Preta e vermelha'], ['azul-especial', 'Azul, edição especial'], ['preta-rosa', 'Preta e rosa']] },
    { key: 'boxhog', brand: 'Adidas Boxing', name: 'Box Hog 4', ghost: 'BOX HOG', price: 1500,
      desc: 'Cabedal em mesh respirável com reforços internos. Entressola EVA para estabilidade e solado multidirecional com ponto de pivô para footwork rápido. O melhor custo-benefício da linha Adidas.',
      colors: [['preta', 'Preta'], ['azul', 'Azul royal'], ['vermelha', 'Vermelha']] },
    { key: 'machomai', brand: 'Nike Boxing', name: 'Machomai 3', ghost: 'MACHOMAI', price: 1100,
      desc: 'Sola fina para máximo contato com o solo. Leve, respirável e com tração equilibrada para pivotar sem travar o joelho. O modelo mais versátil da linha Nike Boxing.',
      colors: [['preta', 'Preta'], ['branca', 'Branca'], ['branca-dourada', 'Branca e dourada'], ['azul', 'Azul royal'], ['vermelha', 'Vermelha']] }
  ];
  var SIZES = [38, 39, 40, 41, 42, 43, 44, 45, 46];
  // vitrine do topo: [modelo, cor]
  var SHELF = [['machomai', 'vermelha'], ['hyperko', 'branca-dourada'], ['boxhog', 'preta']];
  var HOUSES = [
    { name: 'Cleto Reyes', from: 'Cidade do México', feel: 'Compacta, punho firme e sensação seca. Você sente cada golpe conectar.',
      items: [
        { key: 'cleto-velcro', name: 'Traditional Training, velcro', use: 'Treino diário. Calça e tira sozinho.', price: 2400 },
        { key: 'cleto-cadarco', name: 'Traditional Training, cadarço', use: 'Treino e sparring, punho mais firme.', price: 2250 }
      ] },
    { name: 'Rival', from: 'Montreal, Canadá', feel: 'Anatômica e acolchoada. Protege a sua mão e o seu parceiro de sparring.',
      items: [
        { key: 'rival-rs1', name: 'RS1 Ultra Sparring 2.0', use: 'Sparring pesado, máxima proteção.', price: 2100 },
        { key: 'rival-rs2v', name: 'RS2V Super Sparring 2.0', use: 'Sparring com fechamento em velcro.', price: 1900 },
        { key: 'rival-rb10', name: 'RB10 Intelli-Shock Bag', use: 'Saco e manopla, absorve o impacto.', price: 2250 }
      ] }
  ];

  var G = window.gsap, ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);
  var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return n.toLocaleString('pt-BR'); };
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  var src = function (model, color) { return FOTOS + model + '-' + color + '.webp'; };
  var byKey = {}; SHOES.forEach(function (s) { byKey[s.key] = s; });
  var state = {}; SHOES.forEach(function (s) { state[s.key] = { color: 0, size: null }; });
  var current = SHOES[0].key;

  // ---------- reserva: WhatsApp com mensagem pronta, ou Instagram com a mensagem copiada
  var toast;
  function say(msg) {
    if (!toast) { toast = el('div', 'toast'); toast.setAttribute('role', 'status'); document.body.appendChild(toast); }
    toast.textContent = msg; toast.classList.add('on');
    clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove('on'); }, 3200);
  }
  function href(msg) { return CONTATO.whatsapp ? 'https://wa.me/' + CONTATO.whatsapp + '?text=' + encodeURIComponent(msg) : CONTATO.instagram; }
  function wire(a, getMsg) {
    a.target = '_blank'; a.rel = 'noopener';
    var upd = function () { a.href = href(getMsg()); };
    a.addEventListener('pointerenter', upd); a.addEventListener('focus', upd);
    a.addEventListener('click', function () {
      upd();
      if (!CONTATO.whatsapp && navigator.clipboard) navigator.clipboard.writeText(getMsg()).then(function () { say('Mensagem copiada. É só colar no direct da loja.'); }, function () {});
    });
    upd();
  }
  var via = CONTATO.whatsapp ? 'pelo WhatsApp' : 'pelo Instagram';
  function shoeMsg(k) {
    var s = byKey[k], st = state[k];
    return 'Oi! Quero reservar a ' + s.name + ' na cor ' + s.colors[st.color][1].toLowerCase() + (st.size ? ', número ' + st.size : '') + '.';
  }
  $$('.js-contact').forEach(function (a) { wire(a, function () { return 'Oi! Vim pelo site da Clinch Supply.'; }); });

  // ---------- vitrine do topo
  var shelf = $('#shelf');
  SHELF.forEach(function (p) {
    var s = byKey[p[0]];
    var a = el('a', 'boot');
    a.href = '#m-' + s.key; a.dataset.model = s.key;
    a.innerHTML = '<span class="pic"><img alt="" fetchpriority="high"></span><span class="refl" aria-hidden="true"><img alt=""></span><span class="name"></span><span class="price"><small>R$</small>' + fmt(s.price) + '</span>';
    $$('img', a).forEach(function (i) { i.src = src(s.key, p[1]); });
    $('.pic img', a).alt = s.name + ', ' + s.colors.filter(function (c) { return c[0] === p[1]; })[0][1].toLowerCase();
    $('.name', a).textContent = s.name;
    a.addEventListener('click', function (e) { e.preventDefault(); var i = SHOES.indexOf(s); if (s.colors[state[s.key].color][0] !== p[1]) setColor(s.key, s.colors.map(function (c) { return c[0]; }).indexOf(p[1]), false); goTo(i); });
    shelf.appendChild(a);
  });

  // ---------- sala das sapatilhas
  var track = $('#track'), models = $('#models'), show = $('#sapatilhas');
  var P = {};
  SHOES.forEach(function (s, i) {
    var p = el('article', 'panel'); p.id = 'm-' + s.key; p.setAttribute('aria-label', s.name);
    p.innerHTML =
      '<div class="ghost" aria-hidden="true"></div>' +
      '<div class="pv">' +
        '<button class="photo" type="button" data-cursor><span class="floor"></span><span class="tilt"><span class="layer"></span><span class="sheen"></span></span></button>' +
        '<div class="thumbs" role="group"></div>' +
      '</div>' +
      '<div class="info">' +
        '<p class="brand"></p><h3></h3>' +
        '<p class="price"><small>R$</small>' + fmt(s.price) + '</p>' +
        '<p class="desc"></p>' +
        '<p class="cor">Cor: <strong></strong></p>' +
        '<span class="sizes-lbl">Seu número</span><div class="sizes" role="group"></div>' +
        '<a class="btn btn-solid reserve" href="#"></a>' +
        '<p class="note">Pré-venda com chegada em novembro. Original, importado dos EUA.</p>' +
      '</div>';
    $('.ghost', p).textContent = s.ghost;
    $('.brand', p).textContent = s.brand;
    $('h3', p).textContent = s.name;
    $('.desc', p).textContent = s.desc;
    $('.thumbs', p).setAttribute('aria-label', 'Cores da ' + s.name);
    $('.sizes', p).setAttribute('aria-label', 'Número da ' + s.name);
    $('.reserve', p).textContent = 'Reservar ' + via;
    var thumbs = $('.thumbs', p);
    s.colors.forEach(function (c, ci) {
      var b = el('button', 'th'); b.type = 'button'; b.setAttribute('aria-label', c[1]); b.setAttribute('aria-pressed', ci === 0 ? 'true' : 'false');
      var im = el('img'); im.alt = ''; im.loading = 'lazy'; im.src = src(s.key, c[0]); b.appendChild(im);
      b.addEventListener('click', function () { setColor(s.key, ci, true); });
      thumbs.appendChild(b);
    });
    var sizes = $('.sizes', p);
    SIZES.forEach(function (n) {
      var b = el('button'); b.type = 'button'; b.textContent = n; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        var on = state[s.key].size !== n; state[s.key].size = on ? n : null;
        $$('button', sizes).forEach(function (x) { x.setAttribute('aria-pressed', on && x === b ? 'true' : 'false'); });
        current = s.key; updateBar();
      });
      sizes.appendChild(b);
    });
    wire($('.reserve', p), function () { return shoeMsg(s.key); });
    var layer = $('.layer', p), first = el('img'); first.alt = ''; first.src = src(s.key, s.colors[0][0]); layer.appendChild(first);
    track.appendChild(p);
    P[s.key] = { el: p, photo: $('.photo', p), layer: layer, sheen: $('.sheen', p), ghost: $('.ghost', p) };
    paintPanel(s.key);

    var li = el('li'), mb = el('button'); mb.type = 'button'; mb.textContent = s.name; mb.setAttribute('aria-current', i === 0 ? 'true' : 'false');
    mb.addEventListener('click', function () { goTo(i); });
    li.appendChild(mb); models.appendChild(li);
  });
  var modelBtns = $$('button', models);

  function paintPanel(k) {
    var s = byKey[k], st = state[k], p = P[k].el, c = s.colors[st.color];
    $('.cor strong', p).textContent = c[1];
    $('.photo', p).setAttribute('aria-label', 'Ampliar a foto da ' + s.name + ' ' + c[1].toLowerCase());
    var m = 'url("' + src(k, c[0]) + '")';
    P[k].sheen.style.webkitMaskImage = m; P[k].sheen.style.maskImage = m;
    $$('.th', p).forEach(function (b, i) { b.setAttribute('aria-pressed', i === st.color ? 'true' : 'false'); });
  }

  var swapping = {};
  function setColor(k, ci, animate) {
    var s = byKey[k], st = state[k];
    ci = (ci + s.colors.length) % s.colors.length;
    if (ci === st.color) return;
    var dir = ci > st.color ? 1 : -1;
    st.color = ci; current = k; paintPanel(k); updateBar();
    if (lb.open && lb.model === k) showLb();
    var layer = P[k].layer, old = $$('img', layer), img = el('img');
    img.alt = ''; img.src = src(k, s.colors[ci][0]);
    var go = function () {
      if (swapping[k]) swapping[k].progress(1);
      layer.appendChild(img);
      if (!G || REDUCE || !animate) { old.forEach(function (o) { o.remove(); }); return; }
      swapping[k] = G.timeline({ onComplete: function () { old.forEach(function (o) { o.remove(); }); swapping[k] = null; } })
        .to(old, { opacity: 0, x: -50 * dir, filter: 'blur(6px)', duration: 0.35, ease: 'power2.in' }, 0)
        .fromTo(img, { opacity: 0, x: 70 * dir, filter: 'blur(10px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', clearProps: 'filter' }, 0.12);
    };
    (img.decode ? img.decode() : Promise.resolve()).then(go, go);
  }

  // inclinação e brilho seguindo o mouse; arrastar para o lado troca a cor no celular
  SHOES.forEach(function (s) {
    var ph = P[s.key].photo, down = null, swiped = false;
    if (FINE && !REDUCE) {
      ph.addEventListener('pointermove', function (e) {
        var r = ph.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        ph.classList.add('live');
        ph.style.setProperty('--ry', ((x - 0.5) * 16).toFixed(2) + 'deg');
        ph.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
        ph.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        ph.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      ph.addEventListener('pointerleave', function () { ph.classList.remove('live'); ph.style.setProperty('--rx', '0deg'); ph.style.setProperty('--ry', '0deg'); });
    }
    ph.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; swiped = false; });
    ph.addEventListener('pointerup', function (e) {
      if (!down) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y; down = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) { swiped = true; setColor(s.key, state[s.key].color + (dx < 0 ? 1 : -1), true); }
    });
    ph.addEventListener('click', function (e) { if (swiped) { e.preventDefault(); swiped = false; return; } openLb(s.key); });
  });

  // ---------- foto ampliada
  var lb = { el: $('#lb'), img: $('#lbImg'), stage: $('#lbStage'), open: false, model: null, zoom: false, from: null };
  function showLb() {
    var s = byKey[lb.model], c = s.colors[state[lb.model].color];
    lb.img.src = src(lb.model, c[0]); lb.img.alt = s.name + ', ' + c[1].toLowerCase();
    $('#lbName').textContent = s.name; $('#lbColor').textContent = c[1];
  }
  function setZoom(on, e) {
    lb.zoom = on; lb.stage.classList.toggle('zoom', on);
    if (on && e) pan(e);
    lb.img.style.transform = on ? 'scale(2.4)' : '';
  }
  function pan(e) {
    var r = lb.stage.getBoundingClientRect();
    lb.img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '% ' + ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%';
  }
  function openLb(k) {
    lb.model = k; lb.from = document.activeElement; showLb(); setZoom(false);
    lb.el.hidden = false; requestAnimationFrame(function () { lb.el.classList.add('open'); });
    lb.open = true; document.documentElement.style.overflow = 'hidden';
    $('#lbClose').focus();
  }
  function closeLb() {
    if (!lb.open) return;
    lb.open = false; lb.el.classList.remove('open'); document.documentElement.style.overflow = '';
    setTimeout(function () { if (!lb.open) lb.el.hidden = true; }, 360);
    if (lb.from) lb.from.focus({ preventScroll: true });
  }
  $('#lbClose').addEventListener('click', closeLb);
  lb.stage.addEventListener('click', function (e) { setZoom(!lb.zoom, e); });
  lb.stage.addEventListener('pointermove', function (e) { if (lb.zoom) pan(e); });
  document.addEventListener('keydown', function (e) {
    if (!lb.open) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') setColor(lb.model, state[lb.model].color + (e.key === 'ArrowRight' ? 1 : -1), true);
    else if (e.key === 'Tab') { e.preventDefault(); $('#lbClose').focus(); }
  });

  // ---------- navegação entre modelos e barra de reserva
  var pinST = null;
  function goTo(i) {
    if (pinST) {
      var y = pinST.start + (pinST.end - pinST.start) * (i / (SHOES.length - 1));
      window.scrollTo({ top: y + 2, behavior: REDUCE ? 'auto' : 'smooth' });
    } else {
      P[SHOES[i].key].el.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' });
    }
  }
  function markModel(f) {
    // f vai de 0 a (n-1); o fio dourado de cada nome enche conforme o modelo entra
    modelBtns.forEach(function (b, i) {
      b.style.setProperty('--p', Math.max(0, 1 - Math.abs(f - i)).toFixed(3));
      b.setAttribute('aria-current', Math.round(f) === i ? 'true' : 'false');
    });
    var k = SHOES[Math.round(f)].key;
    if (k !== current) { current = k; updateBar(); }
  }
  markModel(0);

  var bar = $('#bar'), barCta = $('#barCta');
  function updateBar() {
    var s = byKey[current], st = state[current];
    $('#barName').textContent = s.name + ', ' + s.colors[st.color][1] + (st.size ? ', nº ' + st.size : '');
    $('#barPrice').textContent = 'R$ ' + fmt(s.price);
  }
  wire(barCta, function () { return shoeMsg(current); });
  updateBar();
  if ('IntersectionObserver' in window) {
    var vis = {};
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.id] = e.isIntersecting; });
      var on = !vis.topo && !vis.closer && !vis.luvas && !vis.guia;
      bar.classList.toggle('on', on); bar.setAttribute('aria-hidden', on ? 'false' : 'true'); barCta.tabIndex = on ? 0 : -1;
    }, { rootMargin: '-20% 0px -20% 0px' });
    ['topo', 'closer', 'luvas', 'guia'].forEach(function (id) { io.observe(document.getElementById(id)); });
    var io2 = new IntersectionObserver(function (es) {
      if (pinST) return;
      es.forEach(function (e) { if (e.isIntersecting) markModel(SHOES.map(function (s) { return 'm-' + s.key; }).indexOf(e.target.id)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    SHOES.forEach(function (s) { io2.observe(P[s.key].el); });
  }

  // ---------- luvas
  var houses = $('#houses'), flt = $('#float'), fltImg = $('img', flt), HAS = {};
  HOUSES.forEach(function (h) {
    var d = el('div', 'house');
    d.innerHTML = '<h3></h3><span class="from"></span><p class="feel"></p><ul></ul>';
    $('h3', d).textContent = h.name; $('.from', d).textContent = h.from; $('.feel', d).textContent = h.feel;
    h.items.forEach(function (g) {
      var li = el('li'), a = el('a', 'gl');
      a.innerHTML = '<span class="gpic" aria-hidden="true"><img alt="" loading="lazy"></span><b></b><span class="use"></span><span class="end"><span class="price"><small>R$</small>' + fmt(g.price) + '</span><span class="go">Reservar</span></span>';
      $('.gpic img', a).src = FOTOS + g.key + '.webp';
      $('b', a).textContent = h.name + ' ' + g.name; $('.use', a).textContent = g.use;
      wire(a, function () { return 'Oi! Quero a luva ' + h.name + ' ' + g.name + '. Quais pesos e cores vocês têm e qual o prazo?'; });
      a.dataset.key = g.key;
      li.appendChild(a); $('ul', d).appendChild(li);
      // a foto da luva aparece seguindo o mouse, se existir em fotos/
      var probe = new Image(); probe.onload = function () { HAS[g.key] = probe.src; }; probe.src = FOTOS + g.key + '.webp';
    });
    houses.appendChild(d);
  });
  if (FINE && G && !REDUCE) {
    var fx = G.quickTo(flt, 'x', { duration: 0.5, ease: 'power3' }), fy = G.quickTo(flt, 'y', { duration: 0.5, ease: 'power3' }), fr = G.quickTo(flt, 'rotation', { duration: 0.6, ease: 'power3' });
    var lastX = 0;
    houses.addEventListener('pointermove', function (e) {
      fx(e.clientX + 170); fy(e.clientY); fr(Math.max(-14, Math.min(14, (e.clientX - lastX) * 0.6))); lastX = e.clientX;
    });
    $$('.gl', houses).forEach(function (a) {
      a.addEventListener('pointerenter', function () {
        var u = HAS[a.dataset.key];
        if (!u) { G.to(flt, { opacity: 0, scale: 0.6, duration: 0.25 }); return; }
        fltImg.src = u; G.to(flt, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.6)' });
      });
    });
    houses.addEventListener('pointerleave', function () { G.to(flt, { opacity: 0, scale: 0.6, duration: 0.3, ease: 'power2.in' }); });
  }

  // ---------- guia de onças
  var OZ = [8, 10, 12, 14, 16], uso = 'sparring', peso = $('#peso'), ozEl = $('#ozOut');
  function recommend(kg, u) {
    if (u === 'luta') return kg <= 66.7 ? [8, 'Luvas de luta oficiais até o meio-médio (66,7 kg) costumam ser de 8 oz. Confirme com o regulamento do evento.'] : [10, 'Acima de 66,7 kg as luvas de luta passam a 10 oz na maioria das federações. Confirme com o regulamento do evento.'];
    if (u === 'saco') return kg < 60 ? [10, 'Leve e rápida para saco e manopla. Boa para trabalhar velocidade e combinação.'] : kg < 80 ? [12, 'Equilíbrio entre velocidade e proteção para o trabalho de saco diário.'] : [14, 'Mais acolchoamento para quem bate pesado no saco todos os dias.'];
    return kg < 57 ? [12, 'Para sparring abaixo de 57 kg, 12 oz já protege bem sem pesar no braço.'] : kg < 70 ? [14, 'Faixa intermediária de sparring. Muitas academias aceitam 14 oz até 70 kg.'] : [16, 'Padrão para sparring acima de 70 kg. Mais proteção para você e para o parceiro.'];
  }
  function calc() {
    var kg = +peso.value; $('#pesoOut').textContent = kg + ' kg';
    var r = recommend(kg, uso), cur = +ozEl.textContent;
    $('#ozNote').textContent = r[1];
    if (cur !== r[0]) {
      if (G && !REDUCE) { var o = { v: cur }; G.to(o, { v: r[0], duration: 0.5, ease: 'power2.out', onUpdate: function () { ozEl.textContent = Math.round(o.v); } }); G.fromTo(ozEl, { scale: 1.1 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }); }
      else ozEl.textContent = r[0];
    }
    $('#ozFill').style.width = ((OZ.indexOf(r[0]) + 0.5) / 5 * 100) + '%';
  }
  var seg = $('#seg'), pill = $('.pill', seg), segBtns = $$('button', seg);
  function placePill() { var b = segBtns.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; })[0]; pill.style.width = b.offsetWidth + 'px'; pill.style.translate = (b.offsetLeft - 5) + 'px 0'; }
  segBtns.forEach(function (b) { b.addEventListener('click', function () { uso = b.dataset.uso; segBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); placePill(); calc(); }); });
  peso.addEventListener('input', calc);
  window.addEventListener('resize', placePill);
  placePill(); calc();

  // ---------- nav
  var nav = $('#nav');
  var onScroll = function () { nav.classList.toggle('solid', window.scrollY > 30); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---------- cursor "Ampliar" sobre as fotos
  if (FINE) {
    var cur = $('#cursor');
    var cx = G ? G.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' }) : function (v) { cur.style.left = v + 'px'; };
    var cy = G ? G.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' }) : function (v) { cur.style.top = v + 'px'; };
    window.addEventListener('pointermove', function (e) {
      cx(e.clientX); cy(e.clientY);
      cur.classList.toggle('on', !!(e.target.closest && e.target.closest('[data-cursor]')) && !lb.open);
    }, { passive: true });
  }

  var root = document.documentElement;
  if (!G || !ST || REDUCE) { root.classList.remove('js-anim'); return; }

  // ---------- abertura: o wordmark abre como no flyer e as sapatilhas sobem na prateleira
  var boots = $$('.boot', shelf);
  G.set('#heroMark', { '--track': '0.02em', opacity: 0 });
  G.set('.hero h1 .s, .hero .tag', { opacity: 0, y: 14 });
  G.set(shelf, { '--shelf': 0 });
  G.set(boots, { opacity: 0, y: 70 });
  root.classList.remove('js-anim');
  G.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
    .to('#heroMark', { '--track': '0.34em', opacity: 1, duration: 1.7, ease: 'expo.out' })
    .to('.hero h1 .s', { opacity: 1, y: 0, duration: 0.9 }, 0.5)
    .to('.hero .tag', { opacity: 1, y: 0, duration: 0.9 }, 0.65)
    .to(shelf, { '--shelf': 1, duration: 1.2, ease: 'power2.inOut' }, 0.45)
    .to(boots, { opacity: 1, y: 0, duration: 1.1, stagger: { each: 0.12, from: 'center' } }, 0.7);

  // a vitrine responde ao mouse com profundidade
  if (FINE) {
    var depth = [26, 12, 26];
    var qs = boots.map(function (b) { return [G.quickTo(b, 'x', { duration: 0.9, ease: 'power3' }), G.quickTo(b, 'rotationZ', { duration: 0.9, ease: 'power3' })]; });
    $('#topo').addEventListener('pointermove', function (e) {
      var px = e.clientX / innerWidth - 0.5;
      qs.forEach(function (q, i) { q[0](px * depth[i]); q[1](px * (i === 1 ? 1.5 : 3)); });
    });
  }
  // ao rolar, a vitrine afunda e o wordmark fecha
  G.to(shelf, { y: 80, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '#topo', start: 'top top', end: 'bottom top', scrub: true } });
  G.to('.hero-top', { y: -40, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#topo', start: '25% top', end: '80% top', scrub: true } });

  // ---------- sala das sapatilhas: no computador, corre na horizontal com o scroll
  var mm = G.matchMedia();
  mm.add('(min-width: 901px)', function () {
    show.classList.add('pinned');
    var n = SHOES.length;
    var dist = function () { return track.scrollWidth - innerWidth; };
    var tw = G.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: show, start: 'top top', end: function () { return '+=' + dist() * 1.15; }, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        snap: { snapTo: 1 / (n - 1), directional: false, duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: 'power2.inOut' },
        onUpdate: function (self) { markModel(self.progress * (n - 1)); }
      }
    });
    pinST = tw.scrollTrigger;
    SHOES.forEach(function (s, i) {
      var p = P[s.key];
      G.fromTo(p.ghost, { xPercent: 14 }, { xPercent: -14, ease: 'none', scrollTrigger: { trigger: p.el, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
      if (i > 0) {
        G.fromTo(p.photo, { scale: 0.82, rotation: 4, opacity: 0.3 }, { scale: 1, rotation: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: p.el, containerAnimation: tw, start: 'left right', end: 'left 30%', scrub: true } });
        G.fromTo($('.info', p.el), { x: 90, opacity: 0 }, { x: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: p.el, containerAnimation: tw, start: 'left 85%', end: 'left 20%', scrub: true } });
      }
    });
    return function () { show.classList.remove('pinned'); pinST = null; };
  });
  // no celular: cada sapatilha entra quando chega na tela
  mm.add('(max-width: 900px)', function () {
    SHOES.forEach(function (s) {
      G.from(P[s.key].photo, { x: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: P[s.key].el, start: 'top 70%' } });
    });
  });

  // ---------- fechamento: o wordmark abre com o scroll
  G.fromTo('#closerMark', { '--track': '0.06em' }, { '--track': '0.42em', ease: 'none', scrollTrigger: { trigger: '#closer', start: 'top 90%', end: 'center 60%', scrub: true } });
  G.fromTo('#closerRule', { scaleX: 0.15 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#closer', start: 'top 85%', end: 'center 60%', scrub: true } });

  // as fotos mudam a altura das coisas quando carregam
  window.addEventListener('load', function () { ST.refresh(); });
})();
