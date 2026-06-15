'use strict';

/* === NAVBAR: scroll state === */
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 40);
  lastScroll = y;
}, { passive: true });

/* === MOBILE MENU === */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', open);
  mobileMenu.setAttribute('aria-hidden', !open);
});

document.querySelectorAll('.mobile-link, .mobile-cta').forEach(el => {
  el.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  });
});

/* === REVEAL ON SCROLL === */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('is-visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach((el, i) => {
  const siblings = el.parentElement.querySelectorAll('.reveal');
  const idx = Array.from(siblings).indexOf(el);
  el.dataset.delay = Math.min(idx * 80, 300);
  revealObserver.observe(el);
});

/* === HERO PARALLAX (weighty, rAF-throttled) === */
const heroImg = document.querySelector('.hero__img');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (heroImg && !reduceMotion) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, window.innerHeight);
      heroImg.style.transform = `translateY(${y * 0.08}px)`;
      ticking = false;
    });
  }, { passive: true });
}

/* === COUNTERS (animate up when hero bar enters view) === */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1400, start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic — matches CSS feel
    el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        reduceMotion
          ? entry.target.textContent = entry.target.dataset.count + (entry.target.dataset.suffix || '')
          : animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(c => countObserver.observe(c));
}

/* === SMOOTH SCROLL for anchor links === */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* === ACTIVE NAV LINK === */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const activateObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}` ? '#C9A030' : '';
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => activateObserver.observe(s));

/* === CONTACT FORM === */
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');

function validateField(id, errorId, check, msg) {
  const el = document.getElementById(id);
  const err = document.getElementById(errorId);
  const val = el.value.trim();
  if (!check(val)) {
    el.classList.add('has-error');
    err.textContent = msg;
    return false;
  }
  el.classList.remove('has-error');
  err.textContent = '';
  return true;
}

function clearError(inputEl, errorEl) {
  inputEl.classList.remove('has-error');
  errorEl.textContent = '';
}

document.getElementById('name').addEventListener('input', () =>
  clearError(document.getElementById('name'), document.getElementById('nameError')));
document.getElementById('phone').addEventListener('input', () =>
  clearError(document.getElementById('phone'), document.getElementById('phoneError')));
document.getElementById('email').addEventListener('input', () =>
  clearError(document.getElementById('email'), document.getElementById('emailError')));
document.getElementById('message').addEventListener('input', () =>
  clearError(document.getElementById('message'), document.getElementById('messageError')));

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nameOk = validateField('name', 'nameError', v => v.length >= 2, 'Įveskite vardą (min. 2 simboliai)');
  const phoneOk = validateField('phone', 'phoneError', v => /^[\+\d\s\-\(\)]{7,}$/.test(v), 'Įveskite teisingą telefono numerį');
  const emailVal = document.getElementById('email').value.trim();
  const emailOk = emailVal === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
  if (!emailOk) {
    document.getElementById('email').classList.add('has-error');
    document.getElementById('emailError').textContent = 'Neteisingas el. pašto formatas';
  }
  const msgOk = validateField('message', 'messageError', v => v.length >= 10, 'Parašykite žinutę (min. 10 simbolių)');

  if (!nameOk || !phoneOk || !emailOk || !msgOk) {
    const firstErr = form.querySelector('.has-error');
    if (firstErr) firstErr.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="8"/>
    </svg>
    Siunčiama...
  `;

  await new Promise(r => setTimeout(r, 1200));

  form.style.display = 'none';
  formSuccess.hidden = false;
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* === SPIN KEYFRAME === */
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
