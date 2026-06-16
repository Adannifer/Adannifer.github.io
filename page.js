'use strict';

gsap.registerPlugin(ScrollTrigger);

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ── Custom cursor ── */
function initCursor() {
  const cur = document.createElement('div');
  cur.id = 'cursor';
  document.body.appendChild(cur);
  let mx = -100, my = -100, cx = -100, cy = -100;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  $$('a, button, .gallery-item, .proj-next-link').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hovered'));
  });
  (function loop() {
    cx += (mx - cx) * 0.14; cy += (my - cy) * 0.14;
    cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
}

/* ── Star canvas ── */
function initStarCanvas() {
  const canvas = $('#star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const COUNT = 70;
  const palette = ['#ff1aa8', '#d7ff45', '#8cc8ff', '#f7f1ea'];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  const stars = Array.from({ length: COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 0.5 + Math.random() * 1.8,
    color: palette[Math.floor(Math.random() * palette.length)],
    speed: 0.015 + Math.random() * 0.04,
    phase: Math.random() * Math.PI * 2,
    baseOp: 0.05 + Math.random() * 0.18,
  }));
  let t = 0;
  (function draw() {
    ctx.clearRect(0, 0, W, H); t += 0.006;
    stars.forEach(s => {
      const op = Math.max(0, s.baseOp + 0.1 * Math.sin(t * 1.2 + s.phase));
      ctx.save(); ctx.globalAlpha = op; ctx.fillStyle = s.color;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      s.y -= s.speed;
      if (s.y < -10) { s.y = H + 10; s.x = Math.random() * W; }
    });
    requestAnimationFrame(draw);
  })();
}

/* ── Acid spark trail ── */
function initCursorBlobs() {
  const trail = $('#blob-trail');
  if (!trail) return;
  const colors = ['#ff1aa8', '#d7ff45', '#8cc8ff', '#ff1aa8'];
  let idx = 0, lastT = 0, lastX = -999, lastY = -999;
  window.addEventListener('mousemove', e => {
    const now = Date.now();
    const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    if (now - lastT < 28 || dist < 8) return;
    lastT = now; lastX = e.clientX; lastY = e.clientY;
    const count = dist > 30 ? 3 : 1;
    for (let i = 0; i < count; i++) {
      const color = colors[idx % colors.length]; idx++;
      const isStar = idx % 7 === 0;
      const size = isStar ? gsap.utils.random(10, 16) : gsap.utils.random(3, 7);
      const spark = document.createElement('div');
      spark.className = 'acid-spark';
      spark.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX}px;top:${e.clientY}px;background:${color};border-radius:${isStar ? '2px' : '50%'};`;
      trail.appendChild(spark);
      gsap.fromTo(spark,
        { opacity: isStar ? 0.85 : 0.65, scale: 1 },
        { x: gsap.utils.random(-22, 22), y: gsap.utils.random(-28, -6),
          scale: 0, opacity: 0,
          duration: gsap.utils.random(0.35, 0.7), ease: 'power2.out',
          onComplete: () => spark.remove() }
      );
    }
  });
}

/* ── Nav scroll ── */
function initNav() {
  const nav = $('#nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
}

/* ── Hero text entrance ── */
function initHeroEntrance() {
  const title = $('.proj-title');
  const meta  = $('.proj-meta-row');
  const num   = $('.proj-num');
  if (!title) return;
  gsap.from([num, title, meta], {
    y: 35, opacity: 0,
    stagger: 0.12, duration: 0.9,
    ease: 'power3.out', delay: 0.2,
  });
}

/* ── Info-card flip entrance (GSAP stagger pop-in) ── */
function initInfoCards() {
  $$('.info-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.info-card');
    gsap.from(cards, {
      opacity: 0,
      scale: 0.78,
      y: 28,
      duration: 0.6,
      ease: 'back.out(1.8)',
      stagger: { each: 0.07, from: 'start' },
      scrollTrigger: { trigger: grid, start: 'top 84%', once: true },
    });
  });

  /* Photo hover — handled by CSS; add cursor pointer */
  $$('.photo-item').forEach(item => { item.style.cursor = 'default'; });
}

/* ── Gallery items scroll reveal ── */
function initScrollReveals() {
  $$('.gallery-item').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 24,
      duration: 0.7, delay: (i % 3) * 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  $$('.proj-stat-item').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 20,
      duration: 0.6, delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  $$('.proj-overview, .gallery-section').forEach(el => {
    gsap.from(el.querySelectorAll('h2, p'), {
      opacity: 0, y: 20,
      stagger: 0.1, duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    });
  });
}

/* ── 3D tilt on info-cards & flow-steps ── */
function initCardTilt() {
  const cards = $$('.info-card, .closing-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width  - 0.5;  // -0.5 → 0.5
      const cy = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(card, {
        rotateX: cy * -8,
        rotateY: cx *  10,
        scale: 1.025,
        duration: 0.22, ease: 'power2.out',
        overwrite: 'auto',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0, scale: 1,
        duration: 0.5, ease: 'back.out(1.4)',
        overwrite: 'auto',
      });
    });
  });
}

/* ── Scroll-reveal for case study sections ── */
function initSectionReveals() {
  $$('.proj-section').forEach(section => {
    const title = section.querySelector('.proj-section-title');
    const body  = section.querySelector('.proj-section-body');
    if (title) gsap.from(title, {
      opacity: 0, x: -30,
      duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 82%', once: true },
    });
    if (body) gsap.from(body.children, {
      opacity: 0, y: 28,
      stagger: 0.07, duration: 0.65,
      ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 78%', once: true },
    });
  });
}

function init() {
  initCursor();
  initStarCanvas();
  initCursorBlobs();
  initNav();
  initHeroEntrance();
  initInfoCards();
  initScrollReveals();
  initCardTilt();
  initSectionReveals();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
