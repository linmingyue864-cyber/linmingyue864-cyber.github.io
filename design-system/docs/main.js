/* =========================================
   BHDS — BH Design System · main.js
   Tác giả: Nguyễn Tiến Đạt
   ========================================= */
(function () {
  'use strict';

  /* ---- Dark / Light Mode ---- */
  function initTheme() {
    const root = document.documentElement;
    const btn  = document.getElementById('themeToggle');
    const STORAGE_KEY = 'bhds-theme';

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      root.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.setAttribute('data-theme', 'dark');
    }

    if (!btn) return;
    btn.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);
      showToast(isDark ? 'Đã chuyển sang giao diện sáng' : 'Đã chuyển sang giao diện tối', 'info');
    });
  }

  /* ---- Sidebar toggle (mobile) ---- */
  function initSidebar() {
    const sidebar   = document.getElementById('sidebar');
    const overlay   = document.getElementById('sidebarOverlay');
    const hamburger = document.getElementById('hamburger');
    if (!sidebar) return;

    function open()  { sidebar.classList.add('open'); overlay && overlay.classList.add('visible'); document.body.style.overflow = 'hidden'; }
    function close() { sidebar.classList.remove('open'); overlay && overlay.classList.remove('visible'); document.body.style.overflow = ''; }

    hamburger && hamburger.addEventListener('click', open);
    overlay   && overlay.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---- Active nav link ---- */
  function initActiveNav() {
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-item').forEach(el => {
      const href = el.getAttribute('href') || '';
      if (href === current || (current === '' && href === 'index.html')) {
        el.classList.add('active');
      }
    });
  }

  /* ---- Copy to clipboard ---- */
  function initCopy() {
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy');
        navigator.clipboard.writeText(text).then(() => {
          const orig = btn.textContent;
          btn.textContent = 'Đã sao chép!';
          setTimeout(() => { btn.textContent = orig; }, 1500);
        });
      });
    });
  }

  /* ---- Smooth in-page scroll ---- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }

  /* ---- Tabs ---- */
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(container => {
      const triggers = container.querySelectorAll('[data-tab-trigger]');
      const panels   = container.querySelectorAll('[data-tab-panel]');
      function activate(index) {
        triggers.forEach((t, i) => { t.classList.toggle('active', i === index); t.setAttribute('aria-selected', i === index); });
        panels.forEach((p, i) => { p.hidden = i !== index; });
      }
      triggers.forEach((t, i) => t.addEventListener('click', () => activate(i)));
      activate(0);
    });
  }

  /* ---- Accordion ---- */
  function initAccordion() {
    document.querySelectorAll('[data-accordion-trigger]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item  = btn.closest('[data-accordion-item]');
        const panel = item.querySelector('[data-accordion-panel]');
        const open  = item.hasAttribute('data-open');
        if (open) {
          item.removeAttribute('data-open');
          panel.style.maxHeight = '0';
          btn.setAttribute('aria-expanded', 'false');
        } else {
          item.setAttribute('data-open', '');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---- Progress bar animation ---- */
  function initProgressDemo() {
    document.querySelectorAll('.progress-fill[data-value]').forEach(el => {
      const v = el.getAttribute('data-value');
      requestAnimationFrame(() => { setTimeout(() => { el.style.width = v + '%'; }, 300); });
    });
  }

  /* ---- Swatch hex copy ---- */
  function initSwatchCopy() {
    document.querySelectorAll('.swatch').forEach(sw => {
      sw.style.cursor = 'pointer';
      sw.addEventListener('click', () => {
        const hex = sw.querySelector('.swatch-hex');
        if (!hex) return;
        const text = hex.textContent;
        navigator.clipboard.writeText(text).then(() => {
          const orig = hex.textContent;
          hex.textContent = 'Đã sao chép!';
          setTimeout(() => { hex.textContent = orig; }, 1200);
        });
      });
    });
  }

  /* ---- Modal demo (open/close) ---- */
  function initModals() {
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-modal-open');
        const modal = document.getElementById(id);
        if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
      });
    });
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const backdrop = btn.closest('.modal-backdrop');
        if (backdrop) { backdrop.style.display = 'none'; document.body.style.overflow = ''; }
      });
    });
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', e => {
        if (e.target === backdrop) { backdrop.style.display = 'none'; document.body.style.overflow = ''; }
      });
    });
  }

  /* ---- Toast notification ---- */
  window.showToast = function (msg, type) {
    type = type || 'info';
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      Object.assign(container.style, { position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: '9999' });
      document.body.appendChild(container);
    }
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = {
      info:    { bg: isDark ? '#0A1E3A' : '#DCF0FF', border: isDark ? 'rgba(38,128,235,.4)' : '#AACCF4', color: isDark ? '#4A9CF0' : '#0A55B0' },
      success: { bg: isDark ? '#0A2A1A' : '#DFFCE8', border: isDark ? 'rgba(18,183,106,.4)' : '#12B76A', color: isDark ? '#12B76A' : '#027A48' },
      warning: { bg: isDark ? '#2A1C00' : '#FFF8E1', border: isDark ? 'rgba(245,158,11,.4)' : '#F59E0B', color: isDark ? '#F59E0B' : '#B45309' },
      danger:  { bg: isDark ? '#2E0A07' : '#FEE4E2', border: isDark ? 'rgba(240,68,56,.4)'  : '#F04438', color: isDark ? '#F04438' : '#B42318' },
    };
    const c = colors[type] || colors.info;
    const toast = document.createElement('div');
    Object.assign(toast.style, {
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      borderRadius: '10px', padding: '12px 16px', fontSize: '14px',
      fontFamily: "'Source Sans 3', sans-serif", fontWeight: '600',
      boxShadow: '0 8px 24px rgba(0,0,0,.15)', maxWidth: '340px',
      opacity: '0', transform: 'translateY(8px) scale(.96)',
      transition: 'opacity .2s ease, transform .2s ease'
    });
    toast.textContent = msg;
    container.appendChild(toast);
    requestAnimationFrame(() => { requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0) scale(1)'; }); });
    setTimeout(() => {
      toast.style.opacity = '0'; toast.style.transform = 'translateY(8px) scale(.96)';
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  };

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    initActiveNav();
    initCopy();
    initAnchors();
    initTabs();
    initAccordion();
    initProgressDemo();
    initSwatchCopy();
    initModals();
  });

})();
