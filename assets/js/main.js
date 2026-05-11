const lamp = document.getElementById('lamp');
const cursorHiddenZones = '.model-host, .local-model-frame, iframe';
const cursorHiddenZoneBuffer = 42;


function syncTopbarHeight() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const height = Math.ceil(topbar.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--topbar-height', `${height}px`);
}

syncTopbarHeight();
window.addEventListener('load', syncTopbarHeight);
window.addEventListener('resize', syncTopbarHeight);
window.addEventListener('orientationchange', () => setTimeout(syncTopbarHeight, 120));

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let lastX = mouseX;
let lastY = mouseY;
let lastTime = performance.now();
let isCursorHidden = false;

function hideCustomCursor() {
  if (isCursorHidden) return;
  isCursorHidden = true;
  document.body.classList.add('cursor-hidden');
  document.body.classList.remove('cursor-card', 'cursor-button');
}

function showCustomCursor() {
  if (!isCursorHidden) return;
  isCursorHidden = false;
  document.body.classList.remove('cursor-hidden');
}

function isInsideCursorHiddenZone(target) {
  return target instanceof Element && Boolean(target.closest(cursorHiddenZones));
}

function isPointNearCursorHiddenZone(x, y, buffer = 0) {
  return Array.from(document.querySelectorAll(cursorHiddenZones)).some((el) => {
    const rect = el.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) return false;

    return (
      x >= rect.left - buffer &&
      x <= rect.right + buffer &&
      y >= rect.top - buffer &&
      y <= rect.bottom + buffer
    );
  });
}

function setCursorPosition(x, y) {
  mouseX = x;
  mouseY = y;

  if (lamp) {
    lamp.style.left = `${mouseX}px`;
    lamp.style.top = `${mouseY}px`;
  }

  document.documentElement.style.setProperty('--cursor-x', `${mouseX}px`);
  document.documentElement.style.setProperty('--cursor-y', `${mouseY}px`);
}

function updateCursorDynamics() {
  const now = performance.now();
  const dx = mouseX - lastX;
  const dy = mouseY - lastY;
  const dt = Math.max(now - lastTime, 16);
  const speed = Math.min(Math.sqrt(dx * dx + dy * dy) / dt, 2.4);
  const size = 22 + speed * 18;

  if (!document.body.classList.contains('cursor-card') && !document.body.classList.contains('cursor-button')) {
    document.documentElement.style.setProperty('--lamp-size', `${size}px`);
  }

  lastX = mouseX;
  lastY = mouseY;
  lastTime = now;
}

function spawnSpark() {
  if (isCursorHidden || window.innerWidth <= 760 || Math.random() <= 0.62) return;

  const spark = document.createElement('span');
  spark.className = 'spark';
  spark.style.left = `${mouseX + (Math.random() * 18 - 9)}px`;
  spark.style.top = `${mouseY + (Math.random() * 18 - 9)}px`;

  const sparkSize = Math.random() * 4 + 3;
  spark.style.width = `${sparkSize}px`;
  spark.style.height = `${sparkSize}px`;

  document.body.appendChild(spark);
  setTimeout(() => spark.remove(), 950);
}

function handleCursorMove(e) {
  const shouldHideCursor =
    isInsideCursorHiddenZone(e.target) ||
    isPointNearCursorHiddenZone(e.clientX, e.clientY, cursorHiddenZoneBuffer);

  if (shouldHideCursor) {
    hideCustomCursor();
    return;
  }

  showCustomCursor();
  setCursorPosition(e.clientX, e.clientY);
  updateCursorDynamics();
  spawnSpark();
}

document.addEventListener('mousemove', handleCursorMove, true);
document.addEventListener('pointermove', handleCursorMove, true);

document.addEventListener('mouseover', (e) => {
  if (isInsideCursorHiddenZone(e.target)) hideCustomCursor();
}, true);

document.addEventListener('pointerover', (e) => {
  if (isInsideCursorHiddenZone(e.target)) hideCustomCursor();
}, true);

document.addEventListener('mouseout', (e) => {
  if (!e.relatedTarget && !e.toElement) {
    hideCustomCursor();
  }
}, true);

document.documentElement.addEventListener('mouseleave', hideCustomCursor);
document.addEventListener('mouseleave', hideCustomCursor, true);
window.addEventListener('blur', hideCustomCursor);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) hideCustomCursor();
});

document.querySelectorAll(cursorHiddenZones).forEach((el) => {
  el.addEventListener('mouseenter', hideCustomCursor);
  el.addEventListener('pointerenter', hideCustomCursor);
  el.addEventListener('mouseleave', showCustomCursor);
  el.addEventListener('pointerleave', showCustomCursor);
});

const revealItems = document.querySelectorAll('[data-reveal]');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.12 });

  revealItems.forEach(item => io.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    const section = document.querySelector(hash);
    if (!section) return;

    e.preventDefault();
    syncTopbarHeight();

    const topbarHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-height')) || 0;
    const extraGap = window.innerWidth <= 760 ? 18 : 24;
    const targetY = section.getBoundingClientRect().top + window.pageYOffset - topbarHeight - extraGap;

    window.history.pushState(null, '', hash);
    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  });
});

const hoverTargets = document.querySelectorAll('.object-card, .btn, .hero-card, .brand-pill');

hoverTargets.forEach((el) => {
  el.addEventListener('mouseenter', () => {
    if (window.innerWidth <= 760) return;

    if (el.classList.contains('object-card') || el.classList.contains('hero-card')) {
      document.body.classList.add('cursor-card');
    } else {
      document.body.classList.add('cursor-button');
    }
    el.classList.add('is-hovered');
  });

  el.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-card', 'cursor-button');
    el.classList.remove('is-hovered');

    if (el.classList.contains('object-card')) el.style.transform = '';
    if (el.classList.contains('btn')) el.style.transform = '';
    if (el.classList.contains('brand-pill')) el.style.transform = '';
    if (el.classList.contains('hero-card')) el.style.transform = 'rotateX(5deg) rotateY(-8deg)';
  });

  el.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 760) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const moveX = (x - rect.width / 2) / rect.width * 10;
    const moveY = (y - rect.height / 2) / rect.height * 10;

    if (el.classList.contains('object-card')) {
      el.style.transform = `translateY(-10px) scale(1.035) rotateX(${-moveY * 0.35}deg) rotateY(${moveX * 0.45}deg)`;
    }

    if (el.classList.contains('btn')) {
      el.style.transform = `translate(${moveX * 0.18}px, ${moveY * 0.18}px)`;
    }

    if (el.classList.contains('brand-pill')) {
      el.style.transform = `translate(${moveX * 0.12}px, ${moveY * 0.12}px)`;
    }

    if (el.classList.contains('hero-card')) {
      el.style.transform = `rotateX(${Math.max(-10, Math.min(10, -moveY * 0.9 + 5))}deg) rotateY(${Math.max(-12, Math.min(12, moveX * 1.2 - 8))}deg) scale(1.015)`;
    }
  });
});
