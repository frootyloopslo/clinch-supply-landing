(function () {
  'use strict';

  // ---------- contato da loja
  // WhatsApp só com números, DDI e DDD. Todos os botões abrem a conversa com a mensagem pronta.
  // Se ficar vazio, os botões caem no Instagram e copiam a mensagem.
  var CONTATO = { whatsapp: '5511991617925', instagram: 'https://www.instagram.com/clinchsupply/' };
  var FOTOS = 'fotos/';

  // ---------- catálogo
  var SIZES = [38, 39, 40, 41, 42, 43, 44, 45, 46];
  var OZS = [10, 12, 14, 16];
  var CATS = {
    shoes: [
      { key: 'hyperko', by: 'Nike Boxing', name: 'HyperKO 3', price: 1900,
        desc: 'A sapatilha mais leve que a Nike já produziu. Cano alto com suporte total de tornozelo e amarração dupla para máxima estabilidade no ringue.',
        colors: [['preta', 'Preta'], ['branca', 'Branca'], ['branca-dourada', 'Branca e dourada'], ['preta-vermelha', 'Preta e vermelha'], ['azul-especial', 'Azul, edição especial'], ['preta-rosa', 'Preta e rosa']] },
      { key: 'boxhog', by: 'Adidas Boxing', name: 'Box Hog 4', price: 1500,
        desc: 'Cabedal em mesh respirável com reforços internos, entressola EVA e solado com ponto de pivô para footwork rápido. O melhor custo-benefício da Adidas.',
        colors: [['preta', 'Preta'], ['azul', 'Azul royal'], ['vermelha', 'Vermelha']] },
      { key: 'machomai', by: 'Nike Boxing', name: 'Machomai 3', price: 1100,
        desc: 'Sola fina para máximo contato com o solo. Leve, respirável e com tração equilibrada para pivotar sem travar o joelho. A mais versátil da Nike Boxing.',
        colors: [['preta', 'Preta'], ['branca', 'Branca'], ['branca-dourada', 'Branca e dourada'], ['azul', 'Azul royal'], ['vermelha', 'Vermelha']] }
    ],
    gloves: [
      { key: 'cleto-velcro', house: 'Cleto Reyes', by: 'Cleto Reyes, Cidade do México', name: 'Traditional Training', variant: 'Velcro', price: 2400,
        desc: 'Compacta, punho firme e sensação seca: você sente cada golpe conectar. Com velcro, calça e tira sozinho. Para o treino de todo dia.' },
      { key: 'cleto-cadarco', house: 'Cleto Reyes', by: 'Cleto Reyes, Cidade do México', name: 'Traditional Training', variant: 'Cadarço', price: 2250,
        desc: 'A mesma Cleto clássica com cadarço, que trava o punho mais firme. Para treino e sparring de quem já tem alguém para amarrar.' },
      { key: 'rival-rs1', house: 'Rival', by: 'Rival, Montreal', name: 'RS1 Ultra Sparring 2.0', price: 2100,
        desc: 'Anatômica e muito acolchoada. Feita para sparring pesado, protege a sua mão e o parceiro.' },
      { key: 'rival-rs2v', house: 'Rival', by: 'Rival, Montreal', name: 'RS2V Super Sparring 2.0', price: 1900,
        desc: 'A proteção de sparring da Rival com fechamento em velcro, para treinar sem depender de ninguém para calçar.' },
      { key: 'rival-rb10', house: 'Rival', by: 'Rival, Montreal', name: 'RB10 Intelli-Shock Bag', price: 2250,
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
  var stage = $('#stage'), shot = $('#shot'), layer = $('#layer'), sheen = $('#sheen'), strip = $('#strip');
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
    $('.note', panel).textContent = p.colors ? 'Pré-venda aberta. Numeração do 38 ao 46 BR.' : 'Original, importada dos EUA. Cores e prazo sob consulta.';
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
    markRail(); putImage(p, dir, 'model'); renderStrip(); renderPanel(priceNow); afterChange();
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
    renderRail(); putImage(p, dir, 'model'); renderStrip(); renderPanel(priceNow); afterChange();
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
    if (e.key === '/') { e.preventDefault(); qIn.focus(); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); if (cur().colors) setColor(S.color[cur().key] + (e.key === 'ArrowRight' ? 1 : -1)); else go(S.idx[S.cat] + (e.key === 'ArrowRight' ? 1 : -1)); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { if (matchMedia('(max-width: 760px)').matches || window.scrollY > innerHeight * 0.4) return; e.preventDefault(); go(S.idx[S.cat] + (e.key === 'ArrowDown' ? 1 : -1)); }
  });
  // o gesto lateral do trackpad sobre a foto troca a cor; a rolagem vertical continua descendo a página
  var wheelAcc = 0, wheelLock = 0;
  stage.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (Date.now() < wheelLock) return;
    wheelAcc += e.deltaX;
    if (Math.abs(wheelAcc) > 50) { var d = wheelAcc > 0 ? 1 : -1; if (cur().colors) setColor(S.color[cur().key] + d); else go(S.idx[S.cat] + d); wheelAcc = 0; wheelLock = Date.now() + 650; }
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
  var cursorEl = $('#cursor'), cursorTxt = $('#cursorTxt');
  if (FINE) {
    var cx = G ? G.quickTo(cursorEl, 'x', { duration: 0.35, ease: 'power3' }) : function (v) { cursorEl.style.left = v + 'px'; };
    var cy = G ? G.quickTo(cursorEl, 'y', { duration: 0.35, ease: 'power3' }) : function (v) { cursorEl.style.top = v + 'px'; };
    window.addEventListener('pointermove', function (e) {
      cx(e.clientX); cy(e.clientY);
      var t = e.target.closest && e.target.closest('[data-cursor]');
      if (t) cursorTxt.textContent = t.dataset.cursor || 'Ampliar';
      cursorEl.classList.toggle('on', !!t && !lb.open && !openSheet);
    }, { passive: true });
  }

  // ---------- busca: a pessoa procura qualquer modelo e "verifica a disponibilidade".
  // O que está no catálogo aparece para provar; o que não está vira uma conversa no direct da loja.
  var IG_DM = 'https://ig.me/m/clinchsupply';
  var IG_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 1.8A3.7 3.7 0 0 0 3.8 7.5v9a3.7 3.7 0 0 0 3.7 3.7h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.3-3.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>';
  var norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); };
  var STOP = ' de da do das dos a o e em com para pra tem voces vcs quero queria procuro procurando modelo modelos cor tamanho numero n oz the ';
  var INDEX = [];
  ['shoes', 'gloves'].forEach(function (cat) {
    CATS[cat].forEach(function (p, i) {
      var words = [p.house, p.by, p.name, p.variant, p.key.replace(/-/g, ' '),
        cat === 'shoes' ? 'sapatilha sapatilhas bota botas tenis ' + SIZES.join(' ') : 'luva luvas ' + OZS.join(' ')]
        .concat((p.colors || []).map(function (c) { return c[1]; }));
      INDEX.push({ cat: cat, i: i, p: p, hay: ' ' + norm(words.join(' ')) + ' ' });
    });
  });
  // devolve os produtos que mais combinam com a busca e se algum cobre todas as palavras
  function lookup(q) {
    var toks = norm(q).split(' ').filter(function (w) { return w && STOP.indexOf(' ' + w + ' ') < 0; });
    if (!toks.length) return { hits: [], exact: false };
    var scored = INDEX.map(function (it) {
      var n = 0;
      toks.forEach(function (w) {
        if (it.hay.indexOf(' ' + w + ' ') > -1 || (!/^\d+$/.test(w) && w.length >= 3 && it.hay.indexOf(w) > -1)) n++;
      });
      return { it: it, n: n };
    });
    var max = Math.max.apply(null, scored.map(function (x) { return x.n; }));
    if (!max) return { hits: [], exact: false };
    return { hits: scored.filter(function (x) { return x.n === max; }).map(function (x) { return x.it; }), exact: max === toks.length };
  }
  var findF = $('#find'), qIn = $('#q'), sug = $('#sug');
  function thumbOf(p) { return p.colors ? srcOf(p, 0) : srcOf(p); }
  function nameOf(p) { return (p.house || p.by.split(' ')[0]) + ' ' + title(p); }
  function renderSug() {
    var q = qIn.value.trim();
    sug.innerHTML = '';
    if (q.length < 2) { sug.hidden = true; return; }
    lookup(q).hits.slice(0, 4).forEach(function (it) {
      var li = el('li'), b = el('button'); b.type = 'button';
      b.innerHTML = '<img alt=""><span></span><span class="price"><small>R$</small>' + fmt(it.p.price) + '</span>';
      $('img', b).src = thumbOf(it.p); $('span', b).textContent = nameOf(it.p);
      b.addEventListener('click', function () { sug.hidden = true; qIn.value = ''; pick(it.cat, it.i); });
      li.appendChild(b); sug.appendChild(li);
    });
    var li = el('li'), b = el('button', 'ask'); b.type = 'button';
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><span></span>';
    $('span', b).textContent = 'Verificar disponibilidade de “' + q + '”';
    b.addEventListener('click', function () { run(qIn.value); });
    li.appendChild(b); sug.appendChild(li);
    sug.hidden = false;
  }
  qIn.addEventListener('input', renderSug);
  qIn.addEventListener('focus', renderSug);
  qIn.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { sug.hidden = true; qIn.blur(); }
    else if (e.key === 'ArrowDown' && !sug.hidden) { e.preventDefault(); $('button', sug).focus(); }
  });
  sug.addEventListener('keydown', function (e) {
    var bs = $$('button', sug), k = bs.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' && k < bs.length - 1) { e.preventDefault(); bs[k + 1].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (k > 0 ? bs[k - 1] : qIn).focus(); }
    else if (e.key === 'Escape') { sug.hidden = true; qIn.focus(); }
  });
  findF.addEventListener('focusout', function () { setTimeout(function () { if (!findF.contains(document.activeElement)) sug.hidden = true; }, 120); });
  findF.addEventListener('submit', function (e) { e.preventDefault(); if (qIn.value.trim()) run(qIn.value); else qIn.focus(); });
  // o campo vazio vai sugerindo o que dá para procurar
  var EX = ['Procurar modelo', 'Winning 16 oz', 'Nike HyperKO 2', 'Hayabusa T3', 'Cleto Reyes Pro'], exI = 0;
  if (anim) setInterval(function () {
    if (document.activeElement === qIn || qIn.value) return;
    qIn.classList.add('swap');
    setTimeout(function () { exI = (exI + 1) % EX.length; qIn.placeholder = EX[exI]; qIn.classList.remove('swap'); }, 300);
  }, 3200);

  var checks = $$('#checks li'), res = $('#res'), runId = 0;
  function dmMsg(q) { return 'Oi! Vim pelo site da Clinch Supply e procurei "' + q + '". Vocês conseguem esse modelo? Qual a disponibilidade?'; }
  function igButton(q, solid) {
    var a = el('a', 'btn ' + (solid ? 'btn-solid' : 'btn-ghost'), IG_SVG + 'Perguntar no direct');
    a.href = IG_DM; a.target = '_blank'; a.rel = 'noopener';
    a.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(dmMsg(q)).then(function () { say('Mensagem copiada. É só colar no direct.'); }, function () {});
    });
    return a;
  }
  function run(q) {
    q = q.trim().slice(0, 80); if (!q) return;
    sug.hidden = true; qIn.blur();
    var r = lookup(q), id = ++runId, found = r.hits.length > 0;
    $('#qShow').textContent = '“' + q + '”';
    res.innerHTML = '';
    checks.forEach(function (li) { li.className = ''; $('.st', li).textContent = ''; });
    openSheetBy('busca');
    var steps = [
      [found ? 'ok' : 'no', found ? (r.exact ? 'Encontrado' : 'Parecido') : 'Não está'],
      [found ? 'ok' : 'no', found ? 'Pré-venda aberta' : 'Fora do lote'],
      r.exact && found ? ['ok', 'Não precisa'] : ['ask', 'A loja confirma']
    ];
    var d = anim ? 700 : 0, lead = anim ? 300 : 0;
    steps.forEach(function (st, k) {
      setTimeout(function () { if (id === runId) checks[k].className = 'on'; }, lead + d * k);
      setTimeout(function () {
        if (id !== runId) return;
        checks[k].className = 'done ' + st[0]; $('.st', checks[k]).textContent = st[1];
        if (k === 2) showResult(q, r);
      }, lead + d * (k + 1) - (anim ? 120 : 0));
    });
  }
  function showResult(q, r) {
    var found = r.hits.length > 0;
    res.innerHTML = found && r.exact
      ? '<h3>Temos na vitrine.</h3><p>Escolha a cor e o número no provador e reserve na hora.</p>'
      : found
        ? '<h3>Esse exato não está no lote atual.</h3><p>A Clinch consegue buscar sob encomenda nos Estados Unidos. Pergunte no direct que a loja confirma a disponibilidade e o prazo.</p>'
        : '<h3>Não está no lote atual.</h3><p>A Clinch busca sob encomenda nos Estados Unidos. Mande no direct que a loja confirma a disponibilidade e o prazo para você.</p>';
    if (!r.exact || !found) { res.appendChild(igButton(q, true)); res.appendChild(el('p', 'note', 'A mensagem vai copiada. É só colar no direct da @clinchsupply.')); }
    if (found) {
      if (!r.exact) res.appendChild(el('p', null, 'Enquanto isso, o mais próximo na vitrine:'));
      var box = el('div', 'hits');
      r.hits.slice(0, 3).forEach(function (it) {
        var b = el('button', 'hit'); b.type = 'button';
        b.innerHTML = '<img alt=""><span><small></small><b></b></span><span class="to">Provar</span>';
        $('img', b).src = thumbOf(it.p); $('small', b).textContent = (it.p.house || it.p.by.split(' ')[0]) + ', R$ ' + fmt(it.p.price); $('b', b).textContent = title(it.p);
        b.addEventListener('click', function () { closeSheet(true); qIn.value = ''; pick(it.cat, it.i); });
        box.appendChild(b);
      });
      res.appendChild(box);
      if (r.exact) { var o = el('p', null, 'Procura outra versão ou cor? '); var a = igButton(q, false); a.className = 'link'; a.textContent = 'Pergunte no direct'; o.appendChild(a); res.appendChild(o); }
    }
    if (anim) G.from(res.children, { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.06, ease: 'expo.out' });
  }

  // ---------- abaixo da vitrine: a coleção, a compra e o contato
  var track = $('#track'), num = 0;
  ['shoes', 'gloves'].forEach(function (cat) {
    CATS[cat].forEach(function (p, i) {
      num++;
      var b = el('button', 'card'); b.type = 'button'; b.dataset.cursor = 'Provar';
      b.innerHTML = '<span class="num">0' + num + '</span><span class="ph"><img alt="" loading="lazy"></span><span class="meta"><small></small><b></b><span class="price"><small>R$</small>' + fmt(p.price) + '</span></span>';
      $('img', b).src = p.colors ? srcOf(p, 0) : srcOf(p);
      $('.meta small', b).textContent = (p.house || p.by.split(' ')[0]) + (p.colors ? ', ' + p.colors.length + ' cores' : '');
      $('b', b).textContent = title(p);
      b.setAttribute('aria-label', 'Provar ' + (p.house ? p.house + ' ' : p.by.split(' ')[0] + ' ') + title(p) + ', R$ ' + fmt(p.price));
      b.addEventListener('click', function () { pick(cat, i); });
      track.appendChild(b);
    });
  });
  // tocar num card sobe até a vitrine e troca o produto quando ela aparece
  function pick(cat, i) {
    var change = function () { if (cat !== S.cat) { S.idx[cat] = i; setCat(cat); } else go(i); };
    window.scrollTo({ top: 0, behavior: anim ? 'smooth' : 'auto' });
    if (anim) setTimeout(change, 420); else change();
  }
  $$('[data-go]').forEach(function (b) {
    b.addEventListener('click', function () { var t = $('#' + b.dataset.go); if (t) t.scrollIntoView({ behavior: anim ? 'smooth' : 'auto', block: 'start' }); });
  });
  // a barra de reserva do celular sai de cena quando o contato aparece
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { $('#bar').classList.toggle('away', es[0].isIntersecting); }).observe($('#contato'));
  var sayEl = $('#say');
  sayEl.innerHTML = sayEl.textContent.split(' ').map(function (w) { return '<span>' + w + '</span>'; }).join(' ');

  var ST = window.ScrollTrigger;
  if (anim && ST) {
    G.registerPlugin(ST);
    var mm = G.matchMedia();
    // no computador a seção da coleção fica presa e a rolagem leva os cards para o lado
    mm.add('(min-width: 761px)', function () {
      var coll = $('#colecao'); coll.classList.add('pin');
      var dist = function () { return Math.max(0, track.offsetWidth - window.innerWidth); };
      var move = G.to(track, { x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: coll, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true } });
      $$('.card', track).forEach(function (c) {
        G.fromTo($('.ph img', c), { xPercent: 6, scale: 0.94 }, { xPercent: -6, scale: 1, ease: 'none',
          scrollTrigger: { trigger: c, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } });
      });
      return function () { coll.classList.remove('pin'); };
    });
    mm.add('(max-width: 760px)', function () {
      G.from('.card', { autoAlpha: 0, x: 40, duration: 0.9, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '#colecao', start: 'top 75%' } });
    });
    // a frase acende palavra por palavra conforme a página desce
    G.fromTo('#say span', { opacity: 0.16 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '#say', start: 'top 82%', end: 'bottom 45%', scrub: true } });
    // a linha dourada da compra se desenha e os passos entram em sequência
    G.fromTo('.rule i', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.rule', start: 'top 90%', end: 'top 45%', scrub: true } });
    G.set('.steps li', { autoAlpha: 0, y: 34 });
    ST.batch('.steps li', { start: 'top 90%', once: true, onEnter: function (els) { G.to(els, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.14, ease: 'expo.out' }); } });
    // fechamento: o convite sobe
    G.from('.talk .kick, .talk h2, .talk .lede, .talk .acts > *', { autoAlpha: 0, y: 30, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.talk', start: 'top 70%' } });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  }

  // ---------- primeira pintura
  readHash();
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
    .from('.rail .it, .cats, .find, .nav .end > *', { autoAlpha: 0, y: 12, duration: 0.7, stagger: 0.05 }, 2.0)
    .from('#layer', { autoAlpha: 0, yPercent: 12, scale: 0.92, duration: 1.2 }, 1.9)
    .from('#panel > *', { autoAlpha: 0, y: 14, duration: 0.7, stagger: 0.05, clearProps: 'all' }, 2.1);
  var skip = function () {
    if (tl.progress() >= 1) return;
    tl.progress(1); G.killTweensOf([big, intro]);
    intro.style.display = 'none'; G.set(navMark, { autoAlpha: 1 });
  };
  window.addEventListener('keydown', skip, { once: true });
  window.addEventListener('pointerdown', skip, { once: true });
})();
