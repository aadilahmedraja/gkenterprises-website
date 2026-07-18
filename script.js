// FIX (products section showing blank on mobile): every getElementById() call below
// is now null-checked before use. Previously, if a single element (e.g. #menuToggle)
// wasn't found, that line threw an error and — because this is all one script with
// no error handling — every line AFTER it silently never ran. That included the
// scroll-reveal code, which is what adds the ".in" class that makes .reveal /
// .reveal-stagger sections (like the whole products grid) fade in from opacity:0.
// If that code never ran, those sections stayed invisible forever. Wrapping each
// block in a null-check means one missing/renamed element can no longer take down
// the rest of the page.

window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('done');
  }, 500);
});

const header = document.getElementById('siteHeader');
if (header) {
  window.addEventListener('scroll', () => { header.classList.toggle('scrolled', window.scrollY > 40); });
}

// FIX: guarded — previously this threw immediately if either element was missing,
// which silently killed every line of JS after it (see note above).
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Cursor glow (desktop/mouse only)
if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  const glow = document.getElementById('cursorGlow');
  if (glow) {
    window.addEventListener('mousemove', (e) => {
      glow.classList.add('active');
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    });
    window.addEventListener('mouseleave', () => glow.classList.remove('active'));
  }
}

// ---------- Scroll reveal (this is the code that makes the products section
// appear — it now runs completely independently of everything above it) ----------
const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
if (reduceMotion) {
  revealEls.forEach(el => el.classList.add('in'));
} else if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  // FIX: fallback for any browser without IntersectionObserver support —
  // reveal everything immediately instead of leaving it invisible forever.
  revealEls.forEach(el => el.classList.add('in'));
}

// FIX (safety net): no matter what else goes wrong elsewhere on the page, force
// every .reveal/.reveal-stagger section visible after 2.5s if it hasn't already
// been revealed. This guarantees content can never get permanently stuck at
// opacity:0 again, even from a future bug we haven't hit yet.
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.in), .reveal-stagger:not(.in)').forEach(el => el.classList.add('in'));
}, 2500);

document.querySelectorAll('.reveal-stagger').forEach(group => {
  Array.from(group.children).forEach((child, i) => { child.style.transitionDelay = (i * 0.08) + 's'; });
});

// Counters
const counters = document.querySelectorAll('.num[data-count]');
if (counters.length) {
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        if (reduceMotion) { el.textContent = target + suffix; countIO.unobserve(el); return; }
        let cur = 0;
        const dur = 1200;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          cur = Math.floor(p * target);
          el.textContent = cur + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countIO.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countIO.observe(c));
}

// Architecture progress line
const archSteps = document.getElementById('archSteps');
const archFill = document.getElementById('archFill');
const stepEls = document.querySelectorAll('.arch-step');
if (archSteps && archFill) {
  window.addEventListener('scroll', () => {
    const rect = archSteps.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height;
    const progressed = Math.min(Math.max(vh * 0.6 - rect.top, 0), total);
    const pct = total > 0 ? (progressed / total) * 100 : 0;
    archFill.style.height = pct + '%';
    stepEls.forEach((step) => {
      const sRect = step.getBoundingClientRect();
      step.classList.toggle('active', sRect.top < vh * 0.6);
    });
  });
}

function getFormData(){
  return {
    name: (document.getElementById('name') || {}).value?.trim() || '',
    company: (document.getElementById('company') || {}).value?.trim() || '',
    email: (document.getElementById('email') || {}).value?.trim() || '',
    product: (document.getElementById('product') || {}).value || '',
    message: (document.getElementById('message') || {}).value?.trim() || ''
  };
}
function buildMessage(d){
  return 'New Quote Request\n\n' +
    'Name: ' + d.name + '\n' +
    'Company: ' + (d.company || '-') + '\n' +
    'Email: ' + d.email + '\n' +
    'Product: ' + d.product + '\n' +
    'Details: ' + (d.message || '-');
}
const quoteForm = document.getElementById('quoteForm');
const sendEmailBtn = document.getElementById('sendEmailBtn');
const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
const formNote = document.getElementById('formNote');

if (quoteForm && sendEmailBtn) {
  sendEmailBtn.addEventListener('click', () => {
    if (!quoteForm.reportValidity()) return;
    const d = getFormData();
    const subject = encodeURIComponent('Quote Request - ' + d.product);
    const body = encodeURIComponent(buildMessage(d));
    window.location.href = 'mailto:salesgkenterprises71@gmail.com?subject=' + subject + '&body=' + body;
    if (formNote) formNote.textContent = 'Opening your email app with this request pre-filled...';
  });
}
if (quoteForm && sendWhatsAppBtn) {
  sendWhatsAppBtn.addEventListener('click', () => {
    if (!quoteForm.reportValidity()) return;
    const d = getFormData();
    const text = encodeURIComponent(buildMessage(d));
    window.open('https://wa.me/918825401171?text=' + text, '_blank');
    if (formNote) formNote.textContent = 'Opening WhatsApp with this request pre-filled...';
  });
}

// Google Maps: auto-link the address text so updating the address updates the map too
const mapLink = document.getElementById('mapLink');
if (mapLink) {
  const addressText = mapLink.textContent.trim().replace(/\s+/g, ' ');
  mapLink.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addressText);
}

// 3D tilt for the flagship product image (desktop/trackpad only — avoids WebKit touch/3D-transform quirks)
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.tilt-3d').forEach(el => {
    const img = el.querySelector('img');
    if (!img) return;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      img.style.transform = 'rotateY(' + (x * 26) + 'deg) rotateX(' + (-y * 26) + 'deg) scale(1.08)';
    });
    el.addEventListener('mouseleave', () => { img.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)'; });
  });
}
