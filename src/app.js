(function () {
  'use strict';

  // ---------- contato da loja
  // Quando a loja passar o WhatsApp, coloque só os números com DDI e DDD (ex.: '5511999998888').
  // Com o número preenchido, todos os botões abrem o WhatsApp com a mensagem pronta.
  var CONTATO = { whatsapp: '', instagram: 'https://www.instagram.com/clinchsupply/' };
  var FOTOS = 'fotos/';

  // ---------- catálogo
  var SIZES = [38, 39, 40, 41, 42, 43, 44, 45, 46];
  var OZS = [10, 12, 14, 16];
  var CATS = {
    shoes: [
      { key: 'hyperko', by: 'Nike Boxing', name: 'HyperKO 3', ghost: 'HYPERKO', price: 1900,
        desc: 'A sapatilha mais leve que a Nike já produziu. Cano alto com suporte total de tornozelo e amarração dupla para máxima estabilidade no ringue.',
        colors: [['preta', 'Preta'], ['branca', 'Branca'], ['branca-dourada', 'Branca e dourada'], ['preta-vermelha', 'Preta e vermelha'], ['azul-especial', 'Azul, edição especial'], ['preta-rosa', 'Preta e rosa']] },
      { key: 'boxhog', by: 'Adidas Boxing', name: 'Box Hog 4', ghost: 'BOX HOG', price: 1500,
        desc: 'Cabedal em mesh respirável com reforços internos, entressola EVA e solado com ponto de pivô para footwork rápido. O melhor custo-benefício da Adidas.',
        colors: [['preta', 'Preta'], ['azul', 'Azul royal'], ['vermelha', 'Vermelha']] },
      { key: 'machomai', by: 'Nike Boxing', name: 'Machomai 3', ghost: 'MACHOMAI', price: 1100,
        desc: 'Sola fina para máximo contato com o solo. Leve, respirável e com tração equilibrada para pivotar sem travar o joelho. A mais versátil da Nike Boxing.',
        colors: [['preta', 'Preta'], ['branca', 'Branca'], ['branca-dourada', 'Branca e dourada'], ['azul', 'Azul royal'], ['vermelha', 'Vermelha']] }
    ],
    gloves: [
      { key: 'cleto-velcro', house: 'Cleto Reyes', by: 'Cleto Reyes, Cidade do México', name: 'Traditional Training', variant: 'Velcro', ghost: 'CLETO', price: 2400,
        desc: 'Compacta, punho firme e sensação seca: você sente cada golpe conectar. Com velcro, calça e tira sozinho. Para o treino de todo dia.' },
      { key: 'cleto-cadarco', house: 'Cleto Reyes', by: 'Cleto Reyes, Cidade do México', name: 'Traditional Training', variant: 'Cadarço', ghost: 'CLETO', price: 2250,
        desc: 'A mesma Cleto clássica com cadarço, que trava o punho mais firme. Para treino e sparring de quem já tem alguém para amarrar.' },
      { key: 'rival-rs1', house: 'Rival', by: 'Rival, Montreal', name: 'RS1 Ultra Sparring 2.0', ghost: 'RIVAL', price: 2100,
        desc: 'Anatômica e muito acolchoada. Feita para sparring pesado, protege a sua mão e o parceiro.' },
      { key: 'rival-rs2v', house: 'Rival', by: 'Rival, Montreal', name: 'RS2V Super Sparring 2.0', ghost: 'RIVAL', price: 1900,
        desc: 'A proteção de sparring da Rival com fechamento em velcro, para treinar sem depender de ninguém para calçar.' },
      { key: 'rival-rb10', house: 'Rival', by: 'Rival, Montreal', name: 'RB10 Intelli-Shock Bag', ghost: 'RIVAL', price: 2250,
        desc: 'Luva de saco e manopla. A espuma absorve o impacto repetido e poupa punho e articulações.' }
    ]
  };

  var G = window.gsap;
  var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return n.toLocaleString('pt-BR'); };
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  var anim = !!G && !REDUCE;

  // ---------- estado: o que está na tela
  var S = { cat: 'shoes', idx: { shoes: 0, gloves: 0 }, color: {}, size: {}, oz: {} };
  CATS.shoes.forEach(function (p) { S.color[p.key] = 0; S.size[p.key] = null; });
  CATS.gloves.forEach(function (p) { S.oz[p.key] = null; });
  var cur = function () { return CATS[S.cat][S.idx[S.cat]]; };
  var title = function (p) { return p.variant ? p.name + ', ' + p.variant.toLowerCase() : p.name; };
  var colorOf = function (p) { return p.colors ? p.colors[S.color[p.key]] : null; };
  var srcOf = function (p, ci) { return p.colors ? FOTOS + p.key + '-' + p.colors[ci == null ? S.color[p.key] : ci][0] + '.webp' : FOTOS + p.key + '.webp'; };

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
  function msgFor(p) {
    if (p.colors) return 'Oi! Quero reservar a ' + p.by.split(' ')[0] + ' ' + p.name + ' na cor ' + colorOf(p)[1].toLowerCase() + (S.size[p.key] ? ', número ' + S.size[p.key] : '') + '.';
    return 'Oi! Quero a luva ' + p.house + ' ' + title(p) + (S.oz[p.key] ? ' de ' + S.oz[p.key] + ' oz' : '') + '. Quais cores vocês têm e qual o prazo?';
  }
  $$('.js-contact').forEach(function (a) { wire(a, function () { return 'Oi! Vim pelo site da Clinch Supply.'; }); });

  // ---------- lista de modelos
  var rail = $('#rail');
  function renderRail() {
    rail.innerHTML = '';
    var groups = S.cat === 'shoes' ? [[null, CATS.shoes]] : [['Cleto Reyes', CATS.gloves.slice(0, 2)], ['Rival', CATS.gloves.slice(2)]];
    groups.forEach(function (g) {
      if (g[0]) rail.appendChild(el('h2', null, g[0]));
      var ul = el('ul');
      g[1].forEach(function (p) {
        var i = CATS[S.cat].indexOf(p), li = el('li'), b = el('button', 'it');
        b.type = 'button'; b.dataset.i = i;
        b.innerHTML = '<span class="tn"><img alt="" loading="lazy"></span><b></b><span class="price"><small>R$</small>' + fmt(p.price) + '</span>';
        $('img', b).src = srcOf(p);
        $('b', b).textContent = p.variant ? p.variant : p.name;
        b.setAttribute('aria-label', (p.house ? p.house + ' ' : '') + title(p) + ', R$ ' + fmt(p.price));
        b.addEventListener('click', function () { go(i); });
        li.appendChild(b); ul.appendChild(li);
      });
      rail.appendChild(ul);
    });
    markRail();
  }
  function markRail() {
    $$('.it', rail).forEach(function (b) {
      var on = +b.dataset.i === S.idx[S.cat];
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on && rail.scrollWidth > rail.clientWidth) rail.scrollTo({ left: b.offsetLeft - (rail.clientWidth - b.offsetWidth) / 2, behavior: anim ? 'smooth' : 'auto' });
    });
    var p = cur();
    if (p.colors) { var im = $('.it[aria-pressed=true] img', rail); if (im) im.src = srcOf(p); }
  }

  // ---------- palco: foto, nome ao fundo, cores
  var stage = $('#stage'), shot = $('#shot'), layer = $('#layer'), sheen = $('#sheen'), ghost = $('#ghost'), strip = $('#strip');
  var prevB = $('#prev'), nextB = $('#next');
  var swap = null;
  function putImage(p, dir, kind) {
    var old = $$('img', layer), img = el('img');
    img.alt = (p.house ? p.house + ' ' : '') + title(p) + (p.colors ? ', ' + colorOf(p)[1].toLowerCase() : '');
    img.src = srcOf(p);
    var m = 'url("' + img.src + '")'; sheen.style.webkitMaskImage = m; sheen.style.maskImage = m;
    var run = function () {
      if (swap) swap.progress(1);
      layer.appendChild(img);
      if (!anim || !old.length) { old.forEach(function (o) { o.remove(); }); return; }
      var tl = G.timeline({ defaults: { ease: 'expo.out' }, onComplete: function () { old.forEach(function (o) { o.remove(); }); swap = null; } });
      if (kind === 'color') {
        // troca de cor: a foto gira de leve, como se a pessoa virasse a sapatilha na mão
        tl.to(old, { autoAlpha: 0, x: -60 * dir, rotationY: -25 * dir, filter: 'blur(6px)', duration: 0.32, ease: 'power2.in' }, 0)
          .fromTo(img, { autoAlpha: 0, x: 70 * dir, rotationY: 30 * dir, filter: 'blur(8px)' }, { autoAlpha: 1, x: 0, rotationY: 0, filter: 'blur(0px)', duration: 0.75, clearProps: 'filter' }, 0.14);
      } else {
        // troca de modelo: a luz baixa, o produto cai para fora e o próximo sobe para o foco
        tl.to(stage, { '--light': 0.25, duration: 0.3, ease: 'power2.in' }, 0)
          .to(old, { autoAlpha: 0, yPercent: 14, scale: 0.9, filter: 'blur(10px)', duration: 0.38, ease: 'power2.in' }, 0)
          .fromTo(img, { autoAlpha: 0, yPercent: -10, scale: 1.08, rotation: 4 * dir, filter: 'blur(12px)' }, { autoAlpha: 1, yPercent: 0, scale: 1, rotation: 0, filter: 'blur(0px)', duration: 1, clearProps: 'filter' }, 0.3)
          .to(stage, { '--light': 1, duration: 0.9, ease: 'power2.out' }, 0.35);
      }
      swap = tl;
    };
    (img.decode ? img.decode() : Promise.resolve()).then(run, run);
  }
  function putGhost(p, dir) {
    if (ghost.textContent === p.ghost) return;
    if (!anim || !ghost.textContent) { ghost.textContent = p.ghost; return; }
    G.timeline()
      .to(ghost, { autoAlpha: 0, xPercent: -6 * dir, letterSpacing: '0.2em', duration: 0.3, ease: 'power2.in' })
      .call(function () { ghost.textContent = p.ghost; })
      .fromTo(ghost, { xPercent: 6 * dir, letterSpacing: '0em' }, { autoAlpha: 1, xPercent: 0, letterSpacing: '0.06em', duration: 1, ease: 'expo.out' });
  }
  function renderStrip() {
    var p = cur(); strip.innerHTML = '';
    prevB.hidden = nextB.hidden = !p.colors;
    if (!p.colors) { strip.appendChild(el('span', 'one', 'Cores e pesos sob consulta com a loja.')); return; }
    p.colors.forEach(function (c, ci) {
      var b = el('button', 'sw'); b.type = 'button'; b.setAttribute('aria-label', c[1]);
      b.setAttribute('aria-pressed', ci === S.color[p.key] ? 'true' : 'false');
      var im = el('img'); im.alt = ''; im.src = srcOf(p, ci); b.appendChild(im);
      b.addEventListener('click', function () { setColor(ci); });
      b.addEventListener('pointerenter', function () { var pre = new Image(); pre.src = srcOf(p, ci); });
      strip.appendChild(b);
    });
    if (anim) G.from($$('.sw', strip), { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.04, ease: 'power3.out' });
  }

  // ---------- ficha
  var panel = $('#panel'), priceNow = null;
  function renderPanel(fromPrice) {
    var p = cur(), c = colorOf(p);
    panel.innerHTML =
      '<h1></h1><p class="by"></p>' +
      '<p class="price big"><small>R$</small><span class="pv"></span></p>' +
      '<p class="desc"></p>' +
      (p.colors ? '<div class="opt"><div class="lbl"><span>Cor</span><strong class="cn"></strong></div></div>' : '') +
      '<div class="opt"><div class="lbl"><span class="ol"></span><span class="os"></span></div><div class="chips" role="group"></div></div>' +
      '<div class="cta"><a class="btn btn-solid reserve" href="#"></a><p class="note"></p></div>';
    $('h1', panel).textContent = title(p);
    $('h1', panel).classList.toggle('long', title(p).length > 16);
    $('.by', panel).textContent = p.by;
    $('.desc', panel).textContent = p.desc;
    if (c) $('.cn', panel).textContent = c[1];
    var chips = $('.chips', panel), list = p.colors ? SIZES : OZS, store = p.colors ? S.size : S.oz;
    $('.ol', panel).textContent = p.colors ? 'Seu número' : 'Peso que você quer';
    chips.setAttribute('aria-label', p.colors ? 'Número' : 'Peso em onças');
    if (!p.colors) $('.os', panel).innerHTML = '<button class="link" type="button" data-open="guia">Qual peso?</button>';
    list.forEach(function (n) {
      var b = el('button'); b.type = 'button'; b.textContent = p.colors ? n : n + ' oz';
      b.setAttribute('aria-pressed', store[p.key] === n ? 'true' : 'false');
      b.addEventListener('click', function () {
        store[p.key] = store[p.key] === n ? null : n;
        $$('button', chips).forEach(function (x) { x.setAttribute('aria-pressed', x === b && store[p.key] ? 'true' : 'false'); });
        updateBar();
      });
      chips.appendChild(b);
    });
    $('.reserve', panel).textContent = (p.colors ? 'Reservar ' : 'Pedir ') + via;
    $('.note', panel).textContent = p.colors ? 'Pré-venda com chegada em novembro. Numeração do 38 ao 46 BR.' : 'Original, importada dos EUA. Cores e prazo sob consulta.';
    wire($('.reserve', panel), function () { return msgFor(cur()); });
    bindOpeners(panel);
    // o preço corre até o valor do modelo novo
    var pv = $('.pv', panel);
    if (anim && fromPrice != null && fromPrice !== p.price) {
      var o = { v: fromPrice };
      G.to(o, { v: p.price, duration: 0.8, ease: 'power3.out', onUpdate: function () { pv.textContent = fmt(Math.round(o.v / 10) * 10); } });
    } else pv.textContent = fmt(p.price);
    priceNow = p.price;
    if (anim) G.from(panel.children, { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.05, ease: 'expo.out', delay: 0.15, clearProps: 'all' });
  }
  function paintColor() {
    var p = cur(), c = colorOf(p);
    var cn = $('.cn', panel); if (cn) cn.textContent = c[1];
    $$('.sw', strip).forEach(function (b, i) { b.setAttribute('aria-pressed', i === S.color[p.key] ? 'true' : 'false'); });
    shot.setAttribute('aria-label', 'Ampliar a foto da ' + title(p) + ' ' + c[1].toLowerCase());
  }

  // ---------- ações
  function go(i, dir) {
    var list = CATS[S.cat];
    i = (i + list.length) % list.length;
    if (i === S.idx[S.cat]) return;
    dir = dir || (i > S.idx[S.cat] ? 1 : -1);
    S.idx[S.cat] = i;
    var p = cur();
    markRail(); putImage(p, dir, 'model'); putGhost(p, dir); renderStrip(); renderPanel(priceNow); afterChange();
  }
  function setColor(ci) {
    var p = cur(); if (!p.colors) return;
    ci = (ci + p.colors.length) % p.colors.length;
    if (ci === S.color[p.key]) return;
    var dir = ci > S.color[p.key] ? 1 : -1;
    S.color[p.key] = ci;
    putImage(p, dir, 'color'); paintColor(); markRail(); afterChange();
    if (lb.open) showLb();
  }
  function setCat(cat) {
    if (cat === S.cat) return;
    S.cat = cat;
    catBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.cat === cat ? 'true' : 'false'); });
    placePill(catPill, catBtns, 4);
    var p = cur(), dir = cat === 'gloves' ? 1 : -1;
    renderRail(); putImage(p, dir, 'model'); putGhost(p, dir); renderStrip(); renderPanel(priceNow); afterChange();
    if (anim) G.from($$('.it', rail), { autoAlpha: 0, x: -16 * dir, duration: 0.55, stagger: 0.05, ease: 'expo.out' });
  }
  // o endereço guarda a escolha (ex.: #hyperko-branca-dourada), para mandar o link de um produto
  function saveHash() {
    var p = cur(), h = '#' + p.key + (p.colors ? '-' + colorOf(p)[0] : '');
    if (location.hash !== h && history.replaceState) history.replaceState(null, '', h);
  }
  function readHash() {
    var h = decodeURIComponent(location.hash.slice(1)); if (!h) return;
    ['shoes', 'gloves'].forEach(function (cat) {
      CATS[cat].forEach(function (p, i) {
        if (h === p.key) { S.cat = cat; S.idx[cat] = i; }
        else if (p.colors && h.indexOf(p.key + '-') === 0) {
          var ci = p.colors.map(function (c) { return c[0]; }).indexOf(h.slice(p.key.length + 1));
          if (ci > -1) { S.cat = cat; S.idx[cat] = i; S.color[p.key] = ci; }
        }
      });
    });
    catBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.cat === S.cat ? 'true' : 'false'); });
  }
  function afterChange() {
    var p = cur();
    saveHash();
    if (p.colors) paintColor(); else shot.setAttribute('aria-label', 'Ampliar a foto da luva ' + p.house + ' ' + title(p));
    updateBar();
  }

  // ---------- categoria
  var cats = $('#cats'), catPill = $('.pill', cats), catBtns = $$('button', cats);
  function placePill(pill, btns, pad) {
    var b = btns.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; })[0];
    pill.style.width = b.offsetWidth + 'px'; pill.style.translate = (b.offsetLeft - pad) + 'px 0';
  }
  catBtns.forEach(function (b) { b.addEventListener('click', function () { setCat(b.dataset.cat); }); });

  // ---------- teclado, roda do mouse e arrastar
  prevB.addEventListener('click', function () { setColor(S.color[cur().key] - 1); });
  nextB.addEventListener('click', function () { setColor(S.color[cur().key] + 1); });
  var openSheet = null;
  document.addEventListener('keydown', function (e) {
    if (lb.open) {
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') setColor(S.color[cur().key] + (e.key === 'ArrowRight' ? 1 : -1));
      else if (e.key === 'Tab') { e.preventDefault(); $('#lbClose').focus(); }
      return;
    }
    if (openSheet) { if (e.key === 'Escape') closeSheet(); else if (e.key === 'Tab') trap(e, openSheet); return; }
    var t = e.target; if (t && (t.tagName === 'INPUT' || t.isContentEditable)) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); if (cur().colors) setColor(S.color[cur().key] + (e.key === 'ArrowRight' ? 1 : -1)); else go(S.idx[S.cat] + (e.key === 'ArrowRight' ? 1 : -1)); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { if (matchMedia('(max-width: 760px)').matches) return; e.preventDefault(); go(S.idx[S.cat] + (e.key === 'ArrowDown' ? 1 : -1)); }
  });
  // no computador, a roda do mouse sobre a foto troca de modelo em vez de rolar a página
  var wheelAcc = 0, wheelLock = 0;
  stage.addEventListener('wheel', function (e) {
    if (matchMedia('(max-width: 760px)').matches) return;
    e.preventDefault();
    if (Date.now() < wheelLock) return;
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) > 60) { go(S.idx[S.cat] + (wheelAcc > 0 ? 1 : -1)); wheelAcc = 0; wheelLock = Date.now() + 650; }
  }, { passive: false });
  var down = null, swiped = false;
  shot.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; swiped = false; });
  shot.addEventListener('pointerup', function (e) {
    if (!down) return;
    var dx = e.clientX - down.x, dy = e.clientY - down.y; down = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      swiped = true;
      if (cur().colors) setColor(S.color[cur().key] + (dx < 0 ? 1 : -1)); else go(S.idx[S.cat] + (dx < 0 ? 1 : -1));
    }
  });
  shot.addEventListener('click', function (e) { if (swiped) { e.preventDefault(); swiped = false; return; } openLb(); });
  if (FINE && !REDUCE) {
    shot.addEventListener('pointermove', function (e) {
      var r = shot.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      shot.classList.add('live');
      shot.style.setProperty('--ry', ((x - 0.5) * 16).toFixed(2) + 'deg');
      shot.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
      shot.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      shot.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    shot.addEventListener('pointerleave', function () { shot.classList.remove('live'); shot.style.setProperty('--rx', '0deg'); shot.style.setProperty('--ry', '0deg'); });
  }

  // ---------- foto ampliada
  var lb = { el: $('#lb'), img: $('#lbImg'), stage: $('#lbStage'), open: false, zoom: false, from: null };
  function showLb() {
    var p = cur(), c = colorOf(p);
    lb.img.src = srcOf(p); lb.img.alt = title(p) + (c ? ', ' + c[1].toLowerCase() : '');
    $('#lbName').textContent = (p.house ? p.house + ' ' : '') + title(p); $('#lbColor').textContent = c ? c[1] : '';
    $('#lbHint').textContent = c ? 'Clique ou toque na foto para aproximar. As setas do teclado trocam a cor.' : 'Clique ou toque na foto para aproximar.';
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
  function openLb() {
    lb.from = document.activeElement; showLb(); setZoom(false);
    lb.el.hidden = false; requestAnimationFrame(function () { lb.el.classList.add('open'); });
    lb.open = true; document.documentElement.style.overflow = 'hidden'; cursorEl.classList.remove('on');
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

  // ---------- painéis: guia de onças e como comprar
  var veil = $('#veil'), sheetFrom = null;
  function trap(e, box) {
    var f = $$('button, a[href], input', box).filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }
  function openSheetBy(id) {
    var sh = $('#sheet-' + id); if (!sh) return;
    if (openSheet) closeSheet(true);
    sheetFrom = document.activeElement; openSheet = sh;
    sh.classList.add('on'); veil.classList.add('on'); document.documentElement.style.overflow = 'hidden';
    if (id === 'guia') { placePill(segPill, segBtns, 5); syncUseOz(); }
    setTimeout(function () { $('[data-close]', sh).focus({ preventScroll: true }); }, 60);
  }
  function closeSheet(quiet) {
    if (!openSheet) return;
    openSheet.classList.remove('on'); veil.classList.remove('on'); document.documentElement.style.overflow = '';
    openSheet = null;
    if (!quiet && sheetFrom) sheetFrom.focus({ preventScroll: true });
  }
  function bindOpeners(root) { $$('[data-open]', root).forEach(function (b) { b.addEventListener('click', function () { openSheetBy(b.dataset.open); }); }); }
  bindOpeners(document.querySelector('.nav'));
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', function () { closeSheet(); }); });
  veil.addEventListener('click', function () { closeSheet(); });

  // ---------- guia de onças
  var OZ = [8, 10, 12, 14, 16], uso = 'sparring', peso = $('#peso'), ozEl = $('#ozOut'), rec = 16;
  function recommend(kg, u) {
    if (u === 'luta') return kg <= 66.7 ? [8, 'Luvas de luta oficiais até o meio-médio (66,7 kg) costumam ser de 8 oz. Confirme com o regulamento do evento.'] : [10, 'Acima de 66,7 kg as luvas de luta passam a 10 oz na maioria das federações. Confirme com o regulamento do evento.'];
    if (u === 'saco') return kg < 60 ? [10, 'Leve e rápida para saco e manopla. Boa para trabalhar velocidade e combinação.'] : kg < 80 ? [12, 'Equilíbrio entre velocidade e proteção para o trabalho de saco diário.'] : [14, 'Mais acolchoamento para quem bate pesado no saco todos os dias.'];
    return kg < 57 ? [12, 'Para sparring abaixo de 57 kg, 12 oz já protege bem sem pesar no braço.'] : kg < 70 ? [14, 'Faixa intermediária de sparring. Muitas academias aceitam 14 oz até 70 kg.'] : [16, 'Padrão para sparring acima de 70 kg. Mais proteção para você e para o parceiro.'];
  }
  var useOz = $('#useOz');
  function syncUseOz() {
    var ok = OZS.indexOf(rec) > -1;
    useOz.hidden = !ok;
    useOz.textContent = S.cat === 'gloves' ? 'Usar ' + rec + ' oz nesta luva' : 'Ver luvas de ' + rec + ' oz';
  }
  function calc() {
    var kg = +peso.value; $('#pesoOut').textContent = kg + ' kg';
    var r = recommend(kg, uso), was = +ozEl.textContent; rec = r[0];
    $('#ozNote').textContent = r[1];
    if (was !== r[0]) {
      if (anim) { var o = { v: was }; G.to(o, { v: r[0], duration: 0.5, ease: 'power2.out', onUpdate: function () { ozEl.textContent = Math.round(o.v); } }); G.fromTo(ozEl, { scale: 1.1 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }); }
      else ozEl.textContent = r[0];
    }
    $('#ozFill').style.width = ((OZ.indexOf(r[0]) + 0.5) / 5 * 100) + '%';
    syncUseOz();
  }
  var seg = $('#seg'), segPill = $('.pill', seg), segBtns = $$('button', seg);
  segBtns.forEach(function (b) { b.addEventListener('click', function () { uso = b.dataset.uso; segBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); placePill(segPill, segBtns, 5); calc(); }); });
  peso.addEventListener('input', calc);
  useOz.addEventListener('click', function () {
    if (S.cat !== 'gloves') setCat('gloves');
    S.oz[cur().key] = rec; closeSheet(true); renderPanel(); updateBar();
    say('Peso de ' + rec + ' oz escolhido para a ' + cur().house + ' ' + title(cur()) + '.');
  });

  // ---------- barra de reserva no celular
  var barCta = $('#barCta');
  function updateBar() {
    var p = cur(), c = colorOf(p);
    $('#barName').textContent = title(p) + (c ? ', ' + c[1] : '') + (p.colors && S.size[p.key] ? ', nº ' + S.size[p.key] : '') + (!p.colors && S.oz[p.key] ? ', ' + S.oz[p.key] + ' oz' : '');
    $('#barPrice').textContent = 'R$ ' + fmt(p.price);
  }
  wire(barCta, function () { return msgFor(cur()); });

  // ---------- cursor "Ampliar" sobre a foto
  var cursorEl = $('#cursor');
  if (FINE) {
    var cx = G ? G.quickTo(cursorEl, 'x', { duration: 0.35, ease: 'power3' }) : function (v) { cursorEl.style.left = v + 'px'; };
    var cy = G ? G.quickTo(cursorEl, 'y', { duration: 0.35, ease: 'power3' }) : function (v) { cursorEl.style.top = v + 'px'; };
    window.addEventListener('pointermove', function (e) {
      cx(e.clientX); cy(e.clientY);
      cursorEl.classList.toggle('on', !!(e.target.closest && e.target.closest('[data-cursor]')) && !lb.open && !openSheet);
    }, { passive: true });
  }

  // ---------- primeira pintura
  readHash();
  ghost.textContent = cur().ghost;
  renderRail(); renderStrip();
  var animWas = anim; anim = false; renderPanel(); anim = animWas;
  putImage(cur(), 1, 'model'); afterChange();
  placePill(catPill, catBtns, 4); placePill(segPill, segBtns, 5); calc();
  window.addEventListener('resize', function () { placePill(catPill, catBtns, 4); if (openSheet) placePill(segPill, segBtns, 5); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placePill(catPill, catBtns, 4); });
  // pré-carrega as outras fotos depois que a tela abre
  window.addEventListener('load', function () {
    setTimeout(function () { CATS.shoes.forEach(function (p) { p.colors.forEach(function (c, ci) { var i = new Image(); i.src = srcOf(p, ci); }); }); CATS.gloves.forEach(function (p) { var i = new Image(); i.src = srcOf(p); }); }, 600);
  });

  // ---------- abertura: o CLINCH grande abre como no flyer e encolhe até virar o logo da barra
  var root = document.documentElement;
  if (!anim) { root.classList.remove('js-anim'); return; }
  var intro = el('div', 'intro'); intro.setAttribute('aria-hidden', 'true');
  intro.innerHTML = '<span class="mark"><b>CLINCH</b><i>SUPPLY</i></span>';
  document.body.appendChild(intro);
  var big = $('.mark', intro), navMark = $('#navMark');
  G.set(big.children[0], { '--track': '0.02em', autoAlpha: 0 });
  G.set(big.children[1], { autoAlpha: 0, y: 10 });
  G.set(navMark, { autoAlpha: 0 });
  root.classList.remove('js-anim');
  G.set('#app', { autoAlpha: 1 });
  var tl = G.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 });
  tl.to(big.children[0], { '--track': '0.34em', autoAlpha: 1, duration: 1.4 })
    .to(big.children[1], { autoAlpha: 1, y: 0, duration: 0.8 }, 0.45)
    .add(function () {
      // FLIP: mede onde o logo da barra está e leva o wordmark grande até lá
      var a = big.getBoundingClientRect(), b = navMark.getBoundingClientRect();
      var s = b.width / a.width;
      G.to(big, { x: (b.left + b.width / 2) - (a.left + a.width / 2), y: (b.top + b.height / 2) - (a.top + a.height / 2), scale: s, duration: 0.9, ease: 'expo.inOut' });
      G.to(intro, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.7, delay: 0.35, ease: 'power2.out' });
    }, 1.55)
    .set(navMark, { autoAlpha: 1 }, 2.45)
    .set(intro, { display: 'none' }, 2.46)
    .from('.rail .it, .cats, .nav .end > *', { autoAlpha: 0, y: 12, duration: 0.7, stagger: 0.05 }, 2.0)
    .from('#layer', { autoAlpha: 0, yPercent: 12, scale: 0.92, duration: 1.2 }, 1.9)
    .from('#panel > *', { autoAlpha: 0, y: 14, duration: 0.7, stagger: 0.05, clearProps: 'all' }, 2.1)
    .from('.ghost', { autoAlpha: 0, letterSpacing: '0em', duration: 1.4 }, 1.9);
  var skip = function () {
    if (tl.progress() >= 1) return;
    tl.progress(1); G.killTweensOf([big, intro]);
    intro.style.display = 'none'; G.set(navMark, { autoAlpha: 1 });
  };
  window.addEventListener('keydown', skip, { once: true });
  window.addEventListener('pointerdown', skip, { once: true });
})();
