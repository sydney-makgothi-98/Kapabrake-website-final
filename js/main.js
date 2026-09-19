/* ============================================================
   KAPABRAKE — Main JavaScript
   ============================================================ */

'use strict';

/* ---- Scroll Progress Bar ---- */
function initProgress() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    bar.style.transform = `scaleX(${pct})`;
  }, { passive: true });
}

/* ---- Navbar ---- */
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---- Mobile Menu ---- */
function initMobileMenu() {
  const burger = document.querySelector('.hamburger');
  const links  = document.querySelector('.nav-links');
  if (!burger || !links) return;

  burger.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    if (isOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  });

  // Close menu when clicking a link
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  });
}

/* ---- Hero Particle Canvas ---- */
function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], raf;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  class P {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : (Math.random() > 0.5 ? -4 : H + 4);
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.8 + 0.4;
      this.a  = Math.random() * 0.45 + 0.08;
      this.c  = Math.random() > 0.75 ? '#e63946' : '#4fc3f7';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.c;
      ctx.globalAlpha = this.a;
      ctx.fill();
    }
  }

  function init() {
    const count = Math.min(110, Math.floor((W * H) / 7500));
    particles = Array.from({ length: count }, () => new P());
  }
  init();
  window.addEventListener('resize', init);

  function drawLines() {
    const D = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < D) {
          ctx.beginPath();
          ctx.strokeStyle = '#4fc3f7';
          ctx.globalAlpha = (1 - d / D) * 0.14;
          ctx.lineWidth   = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    drawLines();
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(tick);
  }
  tick();
}

/* ---- Parallax Hero ---- */
function initParallax() {
  const content = document.querySelector('.hero-content');
  const grid    = document.querySelector('.hero-grid');
  if (!content && !grid) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (content) content.style.transform = `translateY(${y * 0.28}px)`;
    if (grid)    grid.style.transform    = `translateY(${y * 0.12}px)`;
  }, { passive: true });
}

/* ---- Scroll Animations (IntersectionObserver) ---- */
function initScrollAnim() {
  const els = document.querySelectorAll('.aos');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  els.forEach((el, i) => {
    if (!el.dataset.delay) {
      const siblings = Array.from(el.parentElement?.querySelectorAll('.aos') || []);
      const idx = siblings.indexOf(el);
      if (idx > 0) el.dataset.delay = idx * 110;
    }
    io.observe(el);
  });
}

/* ---- Counter Animation ---- */
function countUp(el, target, duration) {
  const start = performance.now();
  const tick  = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.floor(target * ease);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target, parseInt(entry.target.dataset.count), 2200);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  els.forEach(el => io.observe(el));
}

/* ---- 3-D Tilt on Industry Cards ---- */
function initTilt() {
  document.querySelectorAll('.ind-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ---- Smooth Scroll for anchor links ---- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.location.hash = href.replace('#', '');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ---- Grain texture overlay ---- */
function initGrain() {
  const cv  = document.createElement('canvas');
  cv.width  = 180;
  cv.height = 180;
  cv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;opacity:0.025;mix-blend-mode:overlay;';
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(180, 180);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    img.data[i] = img.data[i+1] = img.data[i+2] = v;
    img.data[i+3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  document.body.appendChild(cv);
}

/* ---- Active nav link highlight ---- */
function initActiveNav() {
  const hash = window.location.hash;
  const path = window.location.pathname.split('/').pop();

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');

    if (!href) return;

    // Check hash-based links first
    if (hash && href.endsWith(hash)) {
      link.classList.add('active');
    }
    // Then check path-based links
    else if (!hash && (href === path || (path === '' && href === 'index.html') || (path === 'index.html' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });
}

/* ---- Form submit feedback ---- */
function initForm() {
  const form = document.querySelector('.contact-form form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Message Sent!';
    btn.style.background = '#2d9b5e';
    setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; form.reset(); }, 3500);
  });
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  initProgress();
  initNavbar();
  initMobileMenu();
  initParticles();
  initParallax();
  initScrollAnim();
  initCounters();
  initTilt();
  initSmoothScroll();
  initGrain();
  initActiveNav();
  initForm();
});

// Update active nav link when hash changes
window.addEventListener('hashchange', initActiveNav);
