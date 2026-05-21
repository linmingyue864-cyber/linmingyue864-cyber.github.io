'use strict';

/* ===== STICKY NAV ===== */
const navSticky = document.getElementById('nav-sticky');
const heroNav = document.querySelector('.nav');
let heroNavBottom = 0;

function updateHeroNavBottom() {
  heroNavBottom = heroNav.getBoundingClientRect().bottom + window.scrollY;
}

window.addEventListener('load', updateHeroNavBottom);
window.addEventListener('resize', updateHeroNavBottom);

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  if (scrollY > heroNavBottom - 60) {
    navSticky.classList.add('visible');
  } else {
    navSticky.classList.remove('visible');
  }

  // Back-to-top button
  const btt = document.getElementById('back-to-top');
  if (scrollY > 400) {
    btt.classList.add('show');
  } else {
    btt.classList.remove('show');
  }

  // Active nav link highlight
  highlightActiveSection();
}, { passive: true });


/* ===== ACTIVE NAV LINK ===== */
const sections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link');

function highlightActiveSection() {
  let currentId = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 80;
    if (window.scrollY >= top) {
      currentId = sec.getAttribute('id');
    }
  });

  allNavLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + currentId) {
      link.classList.add('active');
    }
  });
}


/* ===== SMOOTH SCROLL FOR NAV LINKS ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 64;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ===== INTERSECTION OBSERVER — FADE IN ===== */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Trigger skill bars when skills section becomes visible
      const fills = entry.target.querySelectorAll('.skill-fill');
      fills.forEach(fill => {
        const w = fill.getAttribute('data-width');
        if (w) fill.style.width = w + '%';
      });
      // Trigger counters when stats section becomes visible
      const counters = entry.target.querySelectorAll('.stat-number[data-target]');
      counters.forEach(animateCounter);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.section-inner').forEach(el => fadeObserver.observe(el));


/* ===== COUNTER ANIMATION ===== */
function animateCounter(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = 'true';

  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1200;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }

  requestAnimationFrame(step);
}


/* ===== CONTACT FORM VALIDATION ===== */
const form = document.getElementById('contact-form');
if (form) {
  const fields = {
    name: {
      el: document.getElementById('name'),
      err: document.getElementById('name-error'),
      validate(v) {
        if (!v.trim()) return 'Vui lòng nhập họ và tên.';
        if (v.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự.';
        return '';
      }
    },
    email: {
      el: document.getElementById('email'),
      err: document.getElementById('email-error'),
      validate(v) {
        if (!v.trim()) return 'Vui lòng nhập địa chỉ email.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Email không hợp lệ.';
        return '';
      }
    },
    message: {
      el: document.getElementById('message'),
      err: document.getElementById('message-error'),
      validate(v) {
        if (!v.trim()) return 'Vui lòng nhập nội dung tin nhắn.';
        if (v.trim().length < 10) return 'Tin nhắn phải có ít nhất 10 ký tự.';
        return '';
      }
    }
  };

  // Real-time validation on blur
  Object.values(fields).forEach(({ el, err, validate }) => {
    el.addEventListener('blur', () => {
      const msg = validate(el.value);
      err.textContent = msg;
      el.classList.toggle('error', !!msg);
    });
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) {
        const msg = validate(el.value);
        err.textContent = msg;
        el.classList.toggle('error', !!msg);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let hasError = false;
    Object.values(fields).forEach(({ el, err, validate }) => {
      const msg = validate(el.value);
      err.textContent = msg;
      el.classList.toggle('error', !!msg);
      if (msg) hasError = true;
    });

    if (hasError) {
      const firstErr = form.querySelector('.error');
      if (firstErr) firstErr.focus();
      return;
    }

    // Simulate sending
    const btn = document.getElementById('btn-submit');
    const btnText = btn.querySelector('.btn-text');
    const spinner = document.getElementById('btn-spinner');
    const successMsg = document.getElementById('form-success');

    btn.disabled = true;
    btnText.textContent = 'Đang gửi...';
    spinner.hidden = false;

    setTimeout(() => {
      btn.disabled = false;
      btnText.textContent = 'Gửi tin nhắn';
      spinner.hidden = true;
      successMsg.hidden = false;
      form.reset();
      Object.values(fields).forEach(({ el }) => el.classList.remove('error'));

      setTimeout(() => { successMsg.hidden = true; }, 6000);
    }, 1400);
  });
}


/* ===== TYPING EFFECT FOR SUBTITLE ===== */
(function typeEffect() {
  const el = document.querySelector('.title');
  if (!el) return;

  const text = el.textContent.trim();
  el.textContent = '';
  el.style.borderRight = '2px solid rgba(255,255,255,0.7)';

  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      setTimeout(() => { el.style.borderRight = 'none'; }, 600);
    }
  }, 70);
})();


/* ===== PROJECT CARD — SUBTLE TILT EFFECT ===== */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    card.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
