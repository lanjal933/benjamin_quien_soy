(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const NS = 'http://www.w3.org/2000/svg';

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Hero: letras ---------- */
  let ci = 0;
  $$('[data-split]').forEach(el => {
    const txt = el.textContent;
    el.textContent = '';
    [...txt].forEach(c => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.style.setProperty('--i', ci++);
      s.textContent = c === ' ' ? ' ' : c;
      el.appendChild(s);
    });
  });

  /* ---------- Hero: crisantemo que florece ---------- */
  const bloom = $('#bloom');
  const rings = [
    { n: 18, len: 250, w: 20, hue: '#ff6b6b', rot: 1 },
    { n: 16, len: 200, w: 22, hue: '#ff9f43', rot: -1 },
    { n: 14, len: 150, w: 22, hue: '#ffb347', rot: 1 },
    { n: 10, len: 95,  w: 20, hue: '#ffe08a', rot: -1 }
  ];
  const ringEls = rings.map(r => {
    const g = document.createElementNS(NS, 'g');
    for (let i = 0; i < r.n; i++) {
      const p = document.createElementNS(NS, 'ellipse');
      p.setAttribute('cx', 0);
      p.setAttribute('cy', -r.len / 2);
      p.setAttribute('rx', r.w);
      p.setAttribute('ry', r.len / 2);
      p.setAttribute('fill', r.hue);
      p.setAttribute('fill-opacity', '.16');
      p.setAttribute('stroke', r.hue);
      p.setAttribute('stroke-opacity', '.7');
      p.setAttribute('stroke-width', '1.2');
      p.setAttribute('transform', `rotate(${(360 / r.n) * i})`);
      g.appendChild(p);
    }
    bloom.appendChild(g);
    return g;
  });
  const core = document.createElementNS(NS, 'circle');
  core.setAttribute('r', 16);
  core.setAttribute('fill', '#fff3c4');
  bloom.appendChild(core);

  /* ---------- Manifiesto: palabras ---------- */
  const mt = $('#manifestoText');
  const hotWords = ['movimiento', 'ritmo', 'historia', 'intención', 'IA', 'vender'];
  const words = mt.textContent.trim().split(/\s+/);
  mt.textContent = '';
  const wEls = words.map((w, i) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.textContent = w;
    if (hotWords.some(h => w.replace(/[.,:;]/g, '').toLowerCase() === h.toLowerCase())) s.dataset.hot = '1';
    mt.appendChild(s);
    mt.appendChild(document.createTextNode(' '));
    return s;
  });

  /* ---------- Marquee ---------- */
  const rows = $$('.marquee__row').map(el => ({ el, dir: +el.dataset.dir, x: 0, w: el.firstElementChild.offsetWidth }));

  /* ---------- Flujo (servicios) ---------- */
  const flowBody = $('#flowBody'), flowSvg = $('#flowSvg');
  const flowLine = $('#flowLine'), flowBase = $('#flowBase'), pulse = $('#flowPulse');
  const nodes = $$('[data-node]');
  let flowLen = 0, dotEls = [], nodeFrac = [];

  function buildFlow() {
    dotEls.forEach(d => d.remove());
    dotEls = []; nodeFrac = [];
    const W = flowBody.clientWidth, H = flowBody.clientHeight;
    const mobile = innerWidth <= 760;
    const cx = mobile ? 14 : W / 2;
    const amp = mobile ? 6 : 46;
    const pts = [{ x: cx, y: 0 }];
    nodes.forEach((n, i) => {
      const y = n.offsetTop + n.offsetHeight / 2;
      pts.push({ x: cx + (mobile ? 0 : (i % 2 ? amp : -amp)), y, node: true });
    });
    pts.push({ x: cx, y: H });
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], my = (a.y + b.y) / 2;
      d += ` C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
    }
    flowLine.setAttribute('d', d);
    flowBase.setAttribute('d', d);
    flowLen = flowLine.getTotalLength();
    flowLine.style.strokeDasharray = flowLen;
    // fracción de largo donde está cada nodo
    pts.forEach(p => {
      if (!p.node) return;
      let lo = 0, hi = flowLen;
      for (let k = 0; k < 24; k++) {
        const m = (lo + hi) / 2, q = flowLine.getPointAtLength(m);
        q.y < p.y ? lo = m : hi = m;
      }
      nodeFrac.push(lo / flowLen);
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('class', 'flow__dot');
      c.setAttribute('r', 11);
      c.setAttribute('cx', p.x);
      c.setAttribute('cy', p.y);
      flowSvg.appendChild(c);
      dotEls.push(c);
    });
    pulse.parentNode.appendChild(pulse); // pulso arriba de todo
  }

  /* ---------- Trabajo: scroll horizontal ---------- */
  const work = $('#trabajo'), track = $('#workTrack');
  const pars = $$('[data-par]');
  let trackDist = 0;
  function sizeWork() {
    if (reduce) { work.style.height = 'auto'; return; }
    trackDist = Math.max(0, track.scrollWidth - innerWidth);
    work.style.height = (trackDist + innerHeight) + 'px';
  }

  /* ---------- Contacto ---------- */
  const cTitle = $$('#contactTitle span');
  const magnet = $('#magnet');
  const progress = $('#progress');

  /* ---------- Layout ---------- */
  function layout() { rows.forEach(r => r.w = r.el.firstElementChild.offsetWidth); buildFlow(); sizeWork(); update(); }

  /* ---------- Loop ---------- */
  let lastY = scrollY, vel = 0, smooth = 0, ticking = false;

  function update() {
    const y = scrollY, vh = innerHeight;
    const doc = document.documentElement;
    progress.style.transform = `scaleX(${clamp(y / (doc.scrollHeight - vh))})`;
    if (reduce) return;

    // HERO
    const hero = $('#hero'), hp = clamp(y / (hero.offsetHeight - vh));
    const hText = $('.hero__text');
    hText.style.transform = `translateY(${-hp * 14}vh)`;
    hText.style.opacity = 1 - clamp((hp - .55) / .4);
    ringEls.forEach((g, i) => {
      const s = clamp(.15 + hp * (1.05 - i * .05), 0, 1.15);
      g.setAttribute('transform', `rotate(${hp * 120 * rings[i].rot}) scale(${s})`);
      g.style.opacity = clamp(hp * 4 - i * .25, .0, 1);
    });
    core.setAttribute('r', 10 + hp * 26);

    // MANIFIESTO
    const man = $('#manifiesto');
    const mp = clamp((y - man.offsetTop) / (man.offsetHeight - vh));
    const lit = mp * 1.08 * wEls.length;
    wEls.forEach((w, i) => {
      const on = i < lit;
      w.classList.toggle('on', on);
      w.classList.toggle('hot', on && w.dataset.hot && i > lit - 6);
    });

    // FLOW
    const fr = flowBody.getBoundingClientRect();
    const fp = clamp((vh * .55 - fr.top) / fr.height);
    flowLine.style.strokeDashoffset = flowLen * (1 - fp);
    if (fp > 0 && fp < 1) {
      const pt = flowLine.getPointAtLength(flowLen * fp);
      pulse.setAttribute('cx', pt.x); pulse.setAttribute('cy', pt.y); pulse.style.opacity = 1;
    } else pulse.style.opacity = 0;
    nodes.forEach((n, i) => {
      const r = n.getBoundingClientRect();
      n.classList.toggle('in', r.top < vh * .82);
      const live = fp >= (nodeFrac[i] || 2);
      n.classList.toggle('live', live);
      if (dotEls[i]) dotEls[i].classList.toggle('live', live);
    });

    // TRABAJO
    const wp = clamp((y - work.offsetTop) / (work.offsetHeight - vh));
    track.style.transform = `translate3d(${-wp * trackDist}px,0,0)`;
    pars.forEach((p, i) => {
      const card = p.closest('.card'), r = card.getBoundingClientRect();
      const t = (r.left + r.width / 2 - innerWidth / 2) / innerWidth; // -1..1 aprox
      p.style.transform = `translate3d(${t * -60}px,0,0) scale(${1.08 + Math.abs(t) * .05}) rotate(${t * 4}deg)`;
    });

    // CONTACTO: líneas entran desde lados alternos
    const cr = $('#contactTitle').getBoundingClientRect();
    const cp = clamp((vh - cr.top) / (vh * .7));
    cTitle.forEach((s, i) => {
      const dir = i % 2 ? 1 : -1;
      s.style.setProperty('--sx', `${dir * (1 - cp) * 40}vw`);
      s.style.setProperty('--so', clamp(cp * 1.6 - i * .15));
    });
  }

  function tick() {
    ticking = false;
    const y = scrollY;
    vel = y - lastY; lastY = y;
    smooth += (vel - smooth) * .15;
    rows.forEach(r => {
      r.x += r.dir * (0.6 + Math.abs(smooth) * .5);
      if (r.x <= -r.w) r.x += r.w;
      if (r.x > 0) r.x -= r.w;
      r.el.style.transform = `translate3d(${r.x}px,0,0) skewX(${clamp(smooth * -.35, -14, 14)}deg)`;
    });
    update();
    requestAnimationFrame(tick);
  }

  // Imán en el botón de contacto
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    magnet.addEventListener('pointermove', e => {
      const r = magnet.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .25, y = (e.clientY - r.top - r.height / 2) * .35;
      magnet.style.transform = `translate(${x}px,${y}px)`;
    });
    magnet.addEventListener('pointerleave', () => { magnet.style.transform = ''; });
  }

  addEventListener('resize', layout);
  addEventListener('load', layout);
  layout();
  if (!reduce) requestAnimationFrame(tick);
  else { addEventListener('scroll', update, { passive: true }); }
})();
