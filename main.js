/* ═══════════════════════════════════════════════
   JENNIFER QIAN — main.js
   Phase A: Mercury Blob Intro
   Phase B: Scroll Sticky Shrink
   Phase C: Mouse Liquid Distort
   ═══════════════════════════════════════════════ */

'use strict';

gsap.registerPlugin(ScrollTrigger);

/* ── DOM refs ── */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const introEl       = $('#intro');
const introLogo     = $('#intro-logo');
const introLetters  = $$('.iletter');
const introCoin     = $('#intro-coin');
const introCoinScene= $('#intro-coin-scene');
const gooeyBlur     = $('#gooey-blur');
const gooeyMatrix   = $('#gooey-matrix');
const navEl         = $('#nav');
const navLogoSlot   = $('#nav-logo-slot');
const heroEl        = $('#hero');
const heroTitle     = $('#hero-title');
const floatingLogo  = $('#floating-logo');
const flText        = $('#fl-text');
const starCanvas    = $('#star-canvas');
const mainEl        = $('#main');

/* ── Custom cursor ── */
function initCursor() {
  const cur = document.createElement('div');
  cur.id = 'cursor';
  document.body.appendChild(cur);

  let mx = -100, my = -100, cx = -100, cy = -100;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  const clickables = 'a, button, .project-row, .cap-item, .nav-link';
  $$(clickables).forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hovered'));
  });

  function loop() {
    cx += (mx - cx) * 0.14;
    cy += (my - cy) * 0.14;
    cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();
}

/* ════════════════════════════════════════
   STAR CANVAS — particle field
   ════════════════════════════════════════ */
function initStarCanvas() {
  const ctx = starCanvas.getContext('2d');
  let W, H, stars = [];
  const COUNT = 120;
  const palette = ['#ff1aa8', '#d7ff45', '#8cc8ff', '#f7f1ea'];

  function resize() {
    W = starCanvas.width  = window.innerWidth;
    H = starCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function mkStar() {
    const r = Math.random();
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() < 0.15 ? 3 + Math.random() * 4 : 1 + Math.random() * 2,
      isStar: Math.random() < 0.12,   // draw ★ shape
      color: palette[Math.floor(Math.random() * palette.length)],
      speed: 0.02 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.4 + Math.random() * 1.2,
      twinkleAmp: 0.3 + Math.random() * 0.5,
      baseOpacity: 0.08 + Math.random() * 0.25,
    };
  }

  for (let i = 0; i < COUNT; i++) stars.push(mkStar());

  function drawStar5(ctx, x, y, r, color, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const innerAngle = angle + (2 * Math.PI) / 10;
      const ir = r * 0.4;
      if (i === 0) ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
      else ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
      ctx.lineTo(x + ir * Math.cos(innerAngle), y + ir * Math.sin(innerAngle));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.008;
    stars.forEach(s => {
      const opacity = s.baseOpacity + s.twinkleAmp * Math.sin(t * s.twinkleSpeed + s.phase) * 0.5;
      const clampedOp = Math.max(0, Math.min(1, opacity));
      if (s.isStar) {
        drawStar5(ctx, s.x, s.y, s.size * 2, s.color, clampedOp * 0.9);
      } else {
        ctx.save();
        ctx.globalAlpha = clampedOp;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      s.y -= s.speed;
      if (s.y < -20) { s.y = H + 10; s.x = Math.random() * W; }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   PHASE A — COIN FLIP → MERCURY MELT → Jennifer★Qian
   ════════════════════════════════════════ */
function runIntroAnimation() {
  return new Promise(resolve => {
    const coinFace     = $('#coin-face');
    const coinStar     = $('#coin-star');
    const coinStarWrap = $('#coin-star-wrap');
    const heroBlurEl   = $('#hero-blur');
    const heroStar     = $('.hw-star');
    const heroJennifer = $$('#hw-jennifer .hc');
    const heroQian     = $$('#hw-qian .hc');

    // ── Initial states ──
    gsap.set(coinStarWrap, { scale: 1, opacity: 0 });
    gsap.set(introCoin,    { scale: 0.92, opacity: 0, y: 0, transformPerspective: 900, rotationX: 0 });
    gsap.set(coinFace,     { opacity: 1 });
    gsap.set(introLogo,    { opacity: 0 });
    gsap.set(heroEl,       { opacity: 0 });
    // Letters at scale:1 opacity:0 — they hold layout so we can measure positions
    gsap.set([...heroJennifer, heroStar, ...heroQian], { scale: 1, opacity: 0, x: 0, y: 0 });
    heroTitle.style.filter = 'none';

    const tl = gsap.timeline({ onComplete: resolve });

    // 1. Coin materialises
    tl.to(introCoin, { opacity: 1, scale: 1, duration: 0.28, ease: 'power2.out' });

    // 2. Toss up
    tl.to(introCoin, { y: '-38vh', rotationX: 360 * 3.5, duration: 0.8, ease: 'power2.out' });

    // 3. Gravity fall
    tl.to(introCoin, { y: 0, rotationX: `+=${360 * 4}`, duration: 0.64, ease: 'power3.in' });

    // 4. Impact squash + bounce
    tl.to(introCoin, { scaleY: 0.68, scaleX: 1.25, duration: 0.06, ease: 'power3.out' });
    tl.to(introCoin, { y: '-4vh', scaleY: 1.03, scaleX: 0.97, rotationX: `+=${360}`, duration: 0.22, ease: 'power2.out' });
    tl.to(introCoin, { y: 0, scaleY: 0.92, scaleX: 1.05, duration: 0.14, ease: 'power2.in' });
    tl.to(introCoin, { scaleY: 1, scaleX: 1, duration: 0.1, ease: 'sine.out' });
    tl.to(introCoin, { rotationX: 0, duration: 0.12, ease: 'sine.inOut' });

    // 5. Coin disc acid-dissolves — star stays at center
    tl.to(coinFace, { scale: 0.3, opacity: 0, filter: 'blur(20px)', duration: 0.6, ease: 'power3.inOut' });
    tl.to(coinStarWrap, { opacity: 1, duration: 0.25 }, '<0.08');

    // 6. Star morphs pink
    tl.to(coinStar, { color: '#ff1aa8', duration: 0.7, ease: 'power2.inOut' });
    tl.to(coinStar, {
      filter: 'drop-shadow(0 0 24px rgba(255,26,168,0.95)) drop-shadow(0 0 60px rgba(255,26,168,0.4))',
      scale: 1.2,
      duration: 0.42, ease: 'back.out(1.5)',
    }, '<0.28');

    // 7. Hero fades in (letters still invisible, holding layout), intro out
    tl.to(heroEl,     { opacity: 1, duration: 0.5, ease: 'power2.out' }, '<0.15');
    tl.to(introEl,    { opacity: 0, duration: 0.45, ease: 'power2.inOut' }, '<0.25');
    tl.to(starCanvas, { opacity: 1, duration: 0.6,  ease: 'power2.out' }, '<');

    // 8. MERCURY SPLIT
    //    Calculate each letter's distance from the star center,
    //    offset them all to the star, then animate back to natural positions.
    //    Under acid-gooey all clustered letters merge into one blob = the ★ shape,
    //    then they pull apart as blur dissolves = mercury splitting.
    tl.call(() => {
      const allChars = [...heroJennifer, heroStar, ...heroQian];
      const starRect = heroStar.getBoundingClientRect();
      const starCX   = starRect.left + starRect.width  * 0.5;
      const starCY   = starRect.top  + starRect.height * 0.5;

      allChars.forEach(c => {
        const r  = c.getBoundingClientRect();
        const cx = r.left + r.width  * 0.5;
        const cy = r.top  + r.height * 0.5;
        gsap.set(c, { x: starCX - cx, y: starCY - cy, opacity: 1 });
      });

      heroTitle.style.filter = 'url(#acid-gooey)';
      gooeyBlur.setAttribute('stdDeviation', '10');
    });

    // Coin star fades as hero blob appears
    tl.to(coinStarWrap, { opacity: 0, duration: 0.4, ease: 'power2.in' }, '<0.05');

    // Letters spread to natural positions — mercury splits apart
    tl.to([...heroJennifer, heroStar, ...heroQian], {
      x: 0, y: 0,
      stagger: { each: 0.028, from: 'center' },
      duration: 0.72, ease: 'power2.out',
    }, '<0.08');

    // Blur dissolves — blob crystallises into crisp letters
    tl.to(gooeyBlur, { attr: { stdDeviation: 0 }, duration: 0.72, ease: 'power3.inOut' }, '<0.12');

    // Restore hero-title to the acid-hero mouse-interaction filter
    tl.call(() => {
      heroTitle.style.filter = 'url(#acid-hero)';
      if (heroBlurEl) heroBlurEl.setAttribute('stdDeviation', '0');
    });
  });
}

/* ════════════════════════════════════════
   HERO ACID MOUSE — mercury letters on pointer
   ════════════════════════════════════════ */
function initHeroAcid() {
  const chars   = $$('#hero-title .hc');
  const heroBlur = $('#hero-blur');

  // Sync the coin-star-wrap position with the coin during animation
  // (handled via absolute centering in CSS)

  document.addEventListener('mousemove', e => {
    // Only active after hero is visible
    if (parseFloat(getComputedStyle(heroEl).opacity) < 0.5) return;

    let maxForce = 0;

    chars.forEach(c => {
      const r   = c.getBoundingClientRect();
      const cx  = r.left + r.width  * 0.5;
      const cy  = r.top  + r.height * 0.5;
      const d   = Math.hypot(e.clientX - cx, e.clientY - cy);
      const rad = 180;

      if (d < rad) {
        const t  = 1 - d / rad;
        const f  = t * t * 32;
        const ax = Math.atan2(e.clientY - cy, e.clientX - cx);
        maxForce = Math.max(maxForce, t);
        gsap.to(c, {
          x: -Math.cos(ax) * f,
          y: -Math.sin(ax) * f,
          duration: 0.28, ease: 'power2.out', overwrite: 'auto',
        });
      } else {
        gsap.to(c, {
          x: 0, y: 0,
          duration: 0.85, ease: 'elastic.out(1, 0.45)', overwrite: 'auto',
        });
      }
    });

    // Blur rises with proximity — creates mercury blob merge on letters touching
    if (heroBlur) {
      gsap.to(heroBlur, {
        attr: { stdDeviation: maxForce * 4.5 },
        duration: 0.25, ease: 'power2.out', overwrite: 'auto',
      });
    }
  });
}

/* ════════════════════════════════════════
   PHASE B — SCROLL STICKY SHRINK
   The floating logo bridges hero → nav
   ════════════════════════════════════════ */
function initScrollAnimation() {
  // Show nav
  navEl.classList.add('visible');

  // Show floating logo at hero title position
  const heroRect = heroTitle.getBoundingClientRect();

  // Position floating logo precisely over hero title
  gsap.set(floatingLogo, {
    left: heroRect.left,
    top:  heroRect.top,
    width: heroRect.width,
    opacity: 0,
  });
  gsap.set(flText, { fontSize: `${heroRect.height * 0.46}px` });

  // Nav logo target: get nav logo slot bounds
  const getNavTarget = () => navLogoSlot.getBoundingClientRect();

  ScrollTrigger.create({
    trigger: heroEl,
    start: 'top top',
    end: 'bottom top',
    scrub: 0.7,
    onUpdate: self => {
      const p = self.progress;
      const navRect = getNavTarget();
      const hRect = heroTitle.getBoundingClientRect();

      // Source (hero) coords (at p=0)
      const srcX = hRect.left;
      const srcY = hRect.top;
      const srcSize = hRect.height * 0.46;

      // Target (nav) coords (at p=1)
      const tgtX = navRect.left + 4;
      const tgtY = navRect.top + navRect.height / 2 - 11;
      const tgtSize = 17;

      const eased = gsap.parseEase('power2.inOut')(p);

      const x = gsap.utils.interpolate(srcX, tgtX, eased);
      const y = gsap.utils.interpolate(srcY, tgtY, eased);
      const sz = gsap.utils.interpolate(srcSize, tgtSize, eased);

      // Gravity pull: slight vertical stretch at ~p=0.3
      const stretchPeak = Math.sin(p * Math.PI) * 0.08;
      const scaleX = 1 - stretchPeak * 0.4;
      const scaleY = 1 + stretchPeak;

      // Hero fades out 0→0.10, float takes over immediately at 0.10 — zero gap, zero overlap
      const heroOpacity  = 1 - gsap.utils.clamp(0, 1, p / 0.10);
      const floatOpacity = p < 0.10 ? 0 : p < 0.16 ? (p - 0.10) / 0.06 : 1;

      floatingLogo.style.left    = `${x}px`;
      floatingLogo.style.top     = `${y}px`;
      floatingLogo.style.opacity = floatOpacity;
      flText.style.fontSize      = `${sz}px`;
      flText.style.transform     = `scaleX(${scaleX}) scaleY(${scaleY})`;
      heroTitle.style.opacity    = heroOpacity;

      // Show nav logo text only once logo is docked
      gsap.set(navLogoSlot, { opacity: p > 0.92 ? (p - 0.92) / 0.08 : 0 });
      // Hide floating logo once docked
      if (p > 0.95) {
        gsap.set(floatingLogo, { opacity: 1 - (p - 0.95) / 0.05 });
      }

      // Scrolled nav style
      if (p > 0.3) navEl.classList.add('scrolled');
      else navEl.classList.remove('scrolled');
    },
  });

  // Section reveal via IntersectionObserver
  const reveals = $$('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in-view');
        observer.unobserve(en.target);
      }
    });
  }, { threshold: 0.08 });
  reveals.forEach(el => observer.observe(el));

  // Project rows stagger in
  $$('.project-row').forEach((row, i) => {
    gsap.from(row, {
      opacity: 0,
      y: 40,
      duration: 0.9,
      delay: i * 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: row,
        start: 'top 88%',
        once: true,
      },
    });
  });

  // About content
  gsap.from('#about-left > *', {
    opacity: 0, y: 30,
    stagger: 0.15,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: { trigger: '#about', start: 'top 75%', once: true },
  });

  gsap.from('.cap-item', {
    opacity: 0, x: 20,
    stagger: 0.08,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: { trigger: '#about-right', start: 'top 80%', once: true },
  });

  // Contact CTA
  gsap.from('#contact-cta', {
    opacity: 0, y: 50, skewX: -4,
    duration: 1,
    ease: 'power4.out',
    scrollTrigger: { trigger: '#contact', start: 'top 75%', once: true },
  });
}

/* ════════════════════════════════════════
   PHASE C — ACID SPARK TRAIL
   Fine spark particles + magnetic hover states
   ════════════════════════════════════════ */
function initCursorBlobs() {
  const trail  = $('#blob-trail');
  const colors = ['#ff1aa8', '#d7ff45', '#8cc8ff', '#ff1aa8'];
  let   idx    = 0, lastT = 0, lastX = -999, lastY = -999;

  // Spark particle on move
  window.addEventListener('mousemove', e => {
    const now  = Date.now();
    const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    if (now - lastT < 28 || dist < 8) return;
    lastT = now; lastX = e.clientX; lastY = e.clientY;

    // Emit 1–3 sparks per move event for density
    const count = dist > 30 ? 3 : 1;
    for (let i = 0; i < count; i++) {
      const color = colors[idx % colors.length];
      idx++;

      // Two sizes: tiny dots (common) and small crosses/stars (rare)
      const isStar  = idx % 7 === 0;
      const size    = isStar ? gsap.utils.random(10, 16) : gsap.utils.random(3, 7);

      const spark = document.createElement('div');
      spark.className = 'acid-spark';
      spark.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `left:${e.clientX + gsap.utils.random(-4, 4)}px`,
        `top:${e.clientY + gsap.utils.random(-4, 4)}px`,
        `background:${color}`,
        `border-radius:${isStar ? '2px' : '50%'}`,
        isStar ? `transform: rotate(${gsap.utils.random(0,45)}deg)` : '',
      ].join(';');

      trail.appendChild(spark);

      gsap.fromTo(spark,
        { opacity: isStar ? 0.85 : 0.65, scale: 1 },
        {
          x: gsap.utils.random(-22, 22),
          y: gsap.utils.random(-28, -6),
          scale: 0,
          opacity: 0,
          duration: gsap.utils.random(0.35, 0.7),
          ease: 'power2.out',
          onComplete: () => spark.remove(),
        }
      );
    }
  });

  // Magnetic hover: cursor ring snaps to center of hovered elements
  const cur = $('#cursor');
  $$('.project-row, .pr-title, h2.proj-title, #contact-cta').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hovered'));
  });
}

/* ════════════════════════════════════════
   NAV link smooth scroll
   ════════════════════════════════════════ */
function initNavLinks() {
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      const target = $(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ════════════════════════════════════════
   ADD REVEAL CLASSES
   ════════════════════════════════════════ */
function prepareRevealEls() {
  $$('#work .section-header, #about .section-header, #contact .section-header').forEach(el => {
    el.classList.add('reveal');
  });
}

/* gradient.js handles the WebGL background — loaded before this file */
function initGradientBg_REMOVED() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const VS = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `;

  const FS = `
    precision highp float;
    uniform float uT;
    uniform vec2  uRes;

    /* ── Simplex noise 2D ── */
    vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}
    vec2 mod289v2(vec2 x){return x-floor(x*(1./289.))*289.;}
    vec3 permute3(vec3 x){return mod289v3(((x*34.)+1.)*x);}

    float snoise(vec2 v){
      const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
      vec2 i=floor(v+dot(v,C.yy));
      vec2 x0=v-i+dot(i,C.xx);
      vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
      vec4 x12=x0.xyxy+C.xxzz;
      x12.xy-=i1;
      i=mod289v2(i);
      vec3 p=permute3(permute3(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
      vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
      m=m*m; m=m*m;
      vec3 x=2.*fract(p*C.www)-1.;
      vec3 h=abs(x)-.5;
      vec3 ox=floor(x+.5);
      vec3 a0=x-ox;
      m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
      vec3 g;
      g.x =a0.x *x0.x +h.x *x0.y;
      g.yz=a0.yz*x12.xz+h.yz*x12.yw;
      return 130.*dot(m,g);
    }

    void main(){
      vec2 uv=gl_FragCoord.xy/uRes;

      /* Simulate rotationZ=50° */
      float ang=radians(50.);
      vec2 pv=uv-vec2(.5);
      pv=vec2(pv.x*cos(ang)-pv.y*sin(ang),
              pv.x*sin(ang)+pv.y*cos(ang));
      pv+=vec2(.5);

      /* positionX=-1.4 → shift left-of-center view */
      pv.x+=0.22;

      float t=uT*0.4; /* uSpeed=0.4 */

      /* Large-scale smooth noise — single gentle warp pass */
      vec2 p=pv*1.8; /* base scale */

      /* Warp: displace by a fraction of a noise period for organic look */
      vec2 warp=vec2(
        snoise(p*0.6+vec2(t*.5, t*.2)),
        snoise(p*0.6+vec2(t*.2, t*.5)+vec2(5.2,1.3))
      );
      vec2 wp=p+warp*0.55; /* gentle warp — no psychedelic swirl */

      /* Primary wave */
      float n1=snoise(wp+vec2(t*.8,t*.4));
      /* Secondary low-freq layer */
      float n2=snoise(pv*0.9+vec2(-t*.3,t*.5))*0.4;

      float n=(n1*0.5+0.5)*0.75+n2*0.25;
      n=clamp(n,0.,1.);

      /* uStrength=4.7 → push more of the surface to bright */
      n=pow(n,0.55);

      /* Three-colour gradient */
      /* #4a1a6f */ vec3 c1=vec3(.290,.102,.435);
      /* #b4b4db */ vec3 c2=vec3(.706,.706,.859);
      /* #e8c1d6 */ vec3 c3=vec3(.910,.757,.839);

      vec3 col=mix(c1,c2,smoothstep(.22,.62,n));
      col=mix(col,c3,smoothstep(.55,.92,n));

      /* Darken to preserve dark-site aesthetic while keeping colour mood */
      col=pow(col*0.88,vec3(1.55));

      /* grain="on" — time-varying noise */
      float gs=dot(gl_FragCoord.xy,vec2(127.1,311.7));
      float grain=fract(sin(gs+uT*31.7)*43758.5453);
      col+=(grain-.5)*.044;

      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }
  `;

  function mkShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[bg-canvas] shader error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = mkShader(gl.VERTEX_SHADER, VS);
  const fs = mkShader(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uT   = gl.getUniformLocation(prog, 'uT');
  const uRes = gl.getUniformLocation(prog, 'uRes');

  function resize() {
    /* pixelDensity=1 — no retina upscaling for background */
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* Throttle to ~24 fps — background gradient doesn't need 60 fps */
  let start = null, last = 0;
  const INTERVAL = 1000 / 24;

  function render(ts) {
    if (!start) start = ts;
    if (ts - last >= INTERVAL) {
      last = ts;
      gl.uniform1f(uT, (ts - start) * 0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/* ════════════════════════════════════════
   INIT
   ════════════════════════════════════════ */
function skipIntroAnimation() {
  return new Promise(resolve => {
    const heroJennifer = $$('#hw-jennifer .hc');
    const heroStar     = $('.hw-star');
    const heroQian     = $$('#hw-qian .hc');
    // Instantly reveal hero in final state
    gsap.set(heroEl, { opacity: 1 });
    gsap.set(starCanvas, { opacity: 1 });
    gsap.set([...heroJennifer, heroStar, ...heroQian], { opacity: 1, x: 0, y: 0, scale: 1 });
    heroTitle.style.filter = 'url(#acid-hero)';
    resolve();
  });
}

async function init() {
  initCursor();
  initStarCanvas();
  prepareRevealEls();

  // Phase A — only on first visit per session
  const seen = sessionStorage.getItem('introPlayed');
  if (seen) {
    await skipIntroAnimation();
  } else {
    await runIntroAnimation();
    sessionStorage.setItem('introPlayed', '1');
  }

  // Phase B + C
  initScrollAnimation();
  initCursorBlobs();
  initNavLinks();
  initHeroAcid();

  // Hide intro element from accessibility tree
  introEl.setAttribute('aria-hidden', 'true');
  introEl.style.display = 'none';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
