/* Hero dock: one-line name, ~1.3s intro, then on scroll the name flies into the nav banner. */
(function () {
  const body = document.body;
  if (!body.classList.contains('hero-dock') || !window.gsap) return;
  const hero = document.getElementById('hero');
  const title = document.getElementById('hero-title');
  const sub = document.getElementById('hero-sub');
  const nav = document.getElementById('nav');
  const navSlot = document.getElementById('nav-logo-slot');
  const navText = document.getElementById('nav-logo-text');
  const chars = [...title.querySelectorAll('.hc')];
  const star = title.querySelector('.hw-star');
  const letters = chars.filter(c => c !== star);
  const wide = window.matchMedia('(min-width: 701px)');

  function fit() {
    if (!wide.matches) { title.style.fontSize = ''; return; }
    title.style.fontSize = '100px';
    const cs = getComputedStyle(hero);
    const avail = hero.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    title.style.fontSize = (100 * avail / title.getBoundingClientRect().width).toFixed(2) + 'px';
  }

  function intro() {
    gsap.set(navSlot, { opacity: 0 });
    title.style.clipPath = 'inset(-20% -10% -14% -10%)';
    const tl = gsap.timeline({ onComplete: () => { title.style.clipPath = ''; } });
    tl.from(letters, { yPercent: 135, duration: 0.7, ease: 'power4.out', stagger: 0.035 })
      .from(star, { scale: 0, rotation: -140, transformOrigin: '50% 55%', duration: 0.55, ease: 'back.out(2.2)' }, '-=0.38')
      .from(sub, { opacity: 0, y: 12, duration: 0.45, ease: 'power2.out' }, 0.15);
  }

  let st = null;
  function setNav(p) {
    const done = p >= 0.86;
    nav.classList.toggle('docked', done);
    gsap.set(navSlot, { opacity: done ? Math.min(1, (p - 0.86) / 0.1) : 0 });
    title.style.opacity = p < 0.86 ? 1 : Math.max(0, 1 - (p - 0.86) / 0.1);
    if (sub) sub.style.opacity = Math.max(0, 1 - p * 2.2);
  }

  function build() {
    if (st) { st.kill(); st = null; }
    gsap.set(title, { clearProps: 'x,y,scale,transformOrigin' });
    title.style.opacity = '';
    if (sub) sub.style.opacity = '';
    fit();
    if (!wide.matches) {
      // Phones: no fly-in, nav name shows once the hero is mostly scrolled past
      st = ScrollTrigger.create({
        trigger: hero, start: 'top top', end: 'bottom top',
        onUpdate: s => { const on = s.progress > 0.7; nav.classList.toggle('docked', on); gsap.set(navSlot, { opacity: on ? 1 : 0 }); },
        onRefresh: s => { const on = s.progress > 0.7; nav.classList.toggle('docked', on); gsap.set(navSlot, { opacity: on ? 1 : 0 }); },
      });
      return;
    }
    const sy = window.scrollY;
    const tr = title.getBoundingClientRect();
    const nr = navText.getBoundingClientRect();
    const top0 = tr.top + sy;
    const k = nr.width / tr.width;
    const D = Math.round(window.innerHeight * 0.5);
    const yEnd = D + (nr.top + nr.height / 2) - top0 - (tr.height * k) / 2;
    const xEnd = nr.left - tr.left;
    const tw = gsap.fromTo(title, { x: 0, y: 0, scale: 1 }, {
      x: xEnd, y: yEnd, scale: k, transformOrigin: '0 0', ease: 'none',
      scrollTrigger: {
        start: 0, end: D, scrub: true, invalidateOnRefresh: false,
        onUpdate: s => setNav(s.progress),
        onRefresh: s => setNav(s.progress),
      },
    });
    st = tw.scrollTrigger;
  }

  function start() {
    fit();
    intro();
    build();
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { build(); ScrollTrigger.refresh(); }, 200); });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => requestAnimationFrame(start));
  else window.addEventListener('load', start);
})();
