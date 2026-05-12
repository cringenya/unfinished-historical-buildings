const lamp = document.getElementById('lamp');
const cursorHiddenZones = '.model-host, .model-viewer-wrap, .local-model-frame, iframe, model-viewer';
const cursorHiddenZoneBuffer = 42;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let lastX = mouseX;
let lastY = mouseY;
let lastTime = performance.now();
let isCursorHidden = false;

function clearSparks() {
  document.querySelectorAll('.spark').forEach((spark) => spark.remove());
}

function hideCustomCursor() {
  isCursorHidden = true;
  document.body.classList.add('cursor-hidden');
  document.body.classList.remove('cursor-card', 'cursor-button');
  clearSparks();
}

function showCustomCursor() {
  if (!isCursorHidden) return;
  isCursorHidden = false;
  document.body.classList.remove('cursor-hidden');
  lastX = mouseX;
  lastY = mouseY;
  lastTime = performance.now();
  clearSparks();
}

function isInsideCursorHiddenZone(target) {
  return target instanceof Element && Boolean(target.closest(cursorHiddenZones));
}

function isPointNearCursorHiddenZone(x, y, buffer = 0) {
  return Array.from(document.querySelectorAll(cursorHiddenZones)).some((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    return x >= rect.left - buffer && x <= rect.right + buffer && y >= rect.top - buffer && y <= rect.bottom + buffer;
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
  if (isPointNearCursorHiddenZone(mouseX, mouseY, cursorHiddenZoneBuffer)) return;

  const spark = document.createElement('span');
  const sparkSize = Math.random() * 4 + 3;
  const x = mouseX + (Math.random() * 18 - 9);
  const y = mouseY + (Math.random() * 18 - 9);

  spark.className = 'spark';
  spark.style.setProperty('position', 'fixed', 'important');
  spark.style.setProperty('left', `${x}px`, 'important');
  spark.style.setProperty('top', `${y}px`, 'important');
  spark.style.setProperty('width', `${sparkSize}px`, 'important');
  spark.style.setProperty('height', `${sparkSize}px`, 'important');
  spark.style.setProperty('border-radius', '999px', 'important');
  spark.style.setProperty('pointer-events', 'none', 'important');
  spark.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
  spark.style.setProperty('animation', 'none', 'important');
  spark.style.setProperty('opacity', String(0.55 + Math.random() * 0.35), 'important');
  spark.style.setProperty('background', 'rgba(245, 205, 118, .95)', 'important');
  spark.style.setProperty('box-shadow', '0 0 14px rgba(245, 205, 118, .75), 0 0 32px rgba(245, 205, 118, .28)', 'important');
  spark.style.setProperty('z-index', '9999', 'important');
  spark.style.transition = 'opacity 950ms ease-out, filter 950ms ease-out';

  document.body.appendChild(spark);
  requestAnimationFrame(() => {
    spark.style.setProperty('opacity', '0', 'important');
    spark.style.setProperty('filter', 'blur(2px)', 'important');
  });
  setTimeout(() => spark.remove(), 980);
}

function handleCursorMove(e) {
  const shouldHideCursor = isInsideCursorHiddenZone(e.target) || isPointNearCursorHiddenZone(e.clientX, e.clientY, cursorHiddenZoneBuffer);
  if (shouldHideCursor) {
    hideCustomCursor();
    return;
  }

  setCursorPosition(e.clientX, e.clientY);
  showCustomCursor();
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
  if (!e.relatedTarget && !e.toElement) hideCustomCursor();
}, true);
document.addEventListener('pointerout', (e) => {
  if (!e.relatedTarget) hideCustomCursor();
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
  el.addEventListener('mouseleave', hideCustomCursor);
  el.addEventListener('pointerleave', hideCustomCursor);
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
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    const section = document.querySelector(hash);
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', hash);
  });
});

const hoverTargets = document.querySelectorAll('.object-card, .btn, .hero-card, .brand-pill');
hoverTargets.forEach((el) => {
  el.addEventListener('mouseenter', () => {
    if (window.innerWidth <= 760 || isCursorHidden) return;
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
    if (el.classList.contains('object-card') || el.classList.contains('btn') || el.classList.contains('brand-pill')) el.style.transform = '';
    if (el.classList.contains('hero-card')) el.style.transform = 'rotateX(5deg) rotateY(-8deg)';
  });

  el.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 760 || isCursorHidden) return;
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
