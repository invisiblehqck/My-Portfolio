'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

$('#year').textContent = new Date().getFullYear();

// Mobile navigation
const menuToggle = $('#menuToggle');
const navLinks = $('#navLinks');
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  navLinks.classList.toggle('open', !isOpen);
});
$$('.nav-link').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

// Reveal elements as they enter the viewport.
const revealItems = $$('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach(item => item.classList.add('in'));
}

// Project filters
const filterButtons = $$('.filter-button');
const projectCards = $$('.project-card');
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    projectCards.forEach(card => {
      const visible = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !visible);
    });
  });
});

// Gentle 3D tilt for pointer devices. Touch users get the full design without tilt.
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (finePointer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  $$('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 5;
      const rotateX = (0.5 - y) * 4;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  const glow = $('.cursor-glow');
  window.addEventListener('pointermove', event => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });

  const scene = $('#coreScene');
  const visual = $('.hero-visual');
  visual.addEventListener('pointermove', event => {
    const rect = visual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    scene.style.transform = `rotateX(${-12 - y * 9}deg) rotateY(${-22 + x * 13}deg)`;
  });
  visual.addEventListener('pointerleave', () => { scene.style.transform = ''; });
}

// Quiet animated starfield background; no external graphics dependency.
const canvas = $('#starfield');
const context = canvas.getContext && canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (context && !reduceMotion) {
  let width = 0, height = 0, stars = [], raf = 0;
  const makeStars = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(105, Math.floor(width * height / 11500));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.15 + 0.25,
      a: Math.random() * 0.55 + 0.12,
      speed: Math.random() * 0.15 + 0.025,
      phase: Math.random() * Math.PI * 2
    }));
  };
  const draw = time => {
    context.clearRect(0, 0, width, height);
    stars.forEach(star => {
      const twinkle = star.a * (0.7 + Math.sin(time * 0.0007 + star.phase) * 0.3);
      context.beginPath();
      context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      context.fillStyle = `rgba(174, 220, 255, ${twinkle})`;
      context.fill();
      star.y -= star.speed;
      if (star.y < -3) { star.y = height + 3; star.x = Math.random() * width; }
    });
    raf = window.requestAnimationFrame(draw);
  };
  makeStars();
  raf = window.requestAnimationFrame(draw);
  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(makeStars, 120);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.cancelAnimationFrame(raf);
    else raf = window.requestAnimationFrame(draw);
  });
}

// Highlight the current section in navigation.
const sections = $$('main section[id]');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('.nav-link').forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));
}
