/*!
 * bhds.js — BH Design System JavaScript Framework
 * Tác giả : Nguyễn Tiến Đạt
 * Phiên bản: 1.0.0
 * Mô tả   : Thư viện JS thuần, không phụ thuộc.
 *            Hoạt động qua data-* attributes + public API.
 *            ES2019, ~4KB gzip.
 *
 * Cách dùng:
 *   <script src="bhds.js"></script>       → tự động init
 *   import BHDS from './bhds.js'          → ES module
 *   BHDS.use(plugin).init()               → với plugin
 */
(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BHDS = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* =========================================
     INTERNAL HELPERS
     ========================================= */

  function emit(target, name, detail) {
    target.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail || {} }));
  }

  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  /* =========================================
     MODULE: THEME
     ========================================= */
  var STORAGE_KEY = 'bhds-theme';

  function initTheme() {
    var root = document.documentElement;
    var btn  = document.getElementById('themeToggle');
    var saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      root.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.setAttribute('data-theme', 'dark');
    }

    if (!btn) return;
    btn.addEventListener('click', function () {
      var isDark = root.getAttribute('data-theme') === 'dark';
      var next   = isDark ? 'light' : 'dark';
      BHDS.setTheme(next);
      showToast(isDark ? 'Đã chuyển sang giao diện sáng' : 'Đã chuyển sang giao diện tối', 'info');
    });
  }

  /* =========================================
     MODULE: SIDEBAR
     ========================================= */
  function initSidebar() {
    var sidebar   = document.getElementById('sidebar');
    var overlay   = document.getElementById('sidebarOverlay');
    var hamburger = document.getElementById('hamburger');
    if (!sidebar) return;

    function openSidebar() {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('visible');
      document.body.style.overflow = '';
    }

    if (hamburger) hamburger.addEventListener('click', openSidebar);
    if (overlay)   overlay.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSidebar(); });
  }

  /* =========================================
     MODULE: ACTIVE NAV
     ========================================= */
  function initActiveNav() {
    var current = location.pathname.split('/').pop() || 'index.html';
    $$('.sidebar-item').forEach(function (el) {
      var href = el.getAttribute('href') || '';
      if (href === current || (current === '' && href === 'index.html')) {
        el.classList.add('active');
      }
    });
  }

  /* =========================================
     MODULE: COPY TO CLIPBOARD
     ========================================= */
  function initCopy() {
    $$('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        navigator.clipboard.writeText(text).then(function () {
          var orig = btn.textContent;
          btn.textContent = 'Đã sao chép!';
          setTimeout(function () { btn.textContent = orig; }, 1500);
        });
      });
    });
  }

  /* =========================================
     MODULE: SMOOTH ANCHORS
     ========================================= */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* =========================================
     MODULE: TABS
     ========================================= */
  function initTabs() {
    $$('[data-tabs]').forEach(function (container) {
      var triggers = $$('[data-tab-trigger]', container);
      var panels   = $$('[data-tab-panel]', container);

      function activate(index) {
        triggers.forEach(function (t, i) {
          var active = i === index;
          t.classList.toggle('active', active);
          t.setAttribute('aria-selected', active);
          t.style.borderBottomColor = active ? 'var(--color-brand-500)' : 'transparent';
          t.style.color = active ? 'var(--color-brand-600)' : '';
          t.style.fontWeight = active ? '600' : '';
        });
        panels.forEach(function (p, i) { p.hidden = i !== index; });
        emit(container, 'bhds:tab:change', { index: index, trigger: triggers[index], panel: panels[index] });
      }

      triggers.forEach(function (t, i) {
        t.addEventListener('click', function () { activate(i); });
      });
      activate(0);
    });
  }

  /* =========================================
     MODULE: ACCORDION
     ========================================= */
  function initAccordion() {
    $$('[data-accordion-trigger]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item  = btn.closest('[data-accordion-item]');
        var panel = item.querySelector('[data-accordion-panel]');
        var isOpen = item.hasAttribute('data-open');

        if (isOpen) {
          item.removeAttribute('data-open');
          panel.style.maxHeight = '0';
          btn.setAttribute('aria-expanded', 'false');
          emit(item, 'bhds:accordion:close', { item: item, panel: panel });
        } else {
          item.setAttribute('data-open', '');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
          emit(item, 'bhds:accordion:open', { item: item, panel: panel });
        }
      });
    });
  }

  /* =========================================
     MODULE: MODALS
     ========================================= */
  function initModals() {
    $$('[data-modal-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        BHDS.openModal(btn.getAttribute('data-modal-open'));
      });
    });

    $$('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var backdrop = btn.closest('.modal-backdrop');
        if (backdrop) BHDS.closeModal(backdrop.id || null, backdrop);
      });
    });

    $$('.modal-backdrop').forEach(function (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) BHDS.closeModal(backdrop.id || null, backdrop);
      });
    });
  }

  /* =========================================
     MODULE: PROGRESS BAR
     ========================================= */
  function initProgressDemo() {
    $$('.progress-fill[data-value]').forEach(function (el) {
      var v = el.getAttribute('data-value');
      requestAnimationFrame(function () {
        setTimeout(function () { el.style.width = v + '%'; }, 300);
      });
    });
  }

  /* =========================================
     MODULE: SWATCH COPY
     ========================================= */
  function initSwatchCopy() {
    $$('.swatch').forEach(function (sw) {
      sw.style.cursor = 'pointer';
      sw.addEventListener('click', function () {
        var hex = sw.querySelector('.swatch-hex');
        if (!hex) return;
        var text = hex.textContent;
        navigator.clipboard.writeText(text).then(function () {
          var orig = hex.textContent;
          hex.textContent = 'Đã sao chép!';
          setTimeout(function () { hex.textContent = orig; }, 1200);
        });
      });
    });
  }

  /* =========================================
     PUBLIC API: showToast
     ========================================= */
  function showToast(msg, type, duration) {
    type     = type     || 'info';
    duration = duration || 3000;

    var container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      Object.assign(container.style, {
        position: 'fixed', bottom: '24px', right: '24px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        zIndex: '9999', pointerEvents: 'none'
      });
      document.body.appendChild(container);
    }

    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var palette = {
      info:    { bg: isDark ? '#0A1E3A' : '#DCF0FF', border: isDark ? 'rgba(38,128,235,.4)'  : '#AACCF4', color: isDark ? '#4A9CF0' : '#0A55B0' },
      success: { bg: isDark ? '#0A2A1A' : '#DFFCE8', border: isDark ? 'rgba(18,183,106,.4)'  : '#12B76A', color: isDark ? '#12B76A' : '#027A48' },
      warning: { bg: isDark ? '#2A1C00' : '#FFF8E1', border: isDark ? 'rgba(245,158,11,.4)'  : '#F59E0B', color: isDark ? '#F59E0B' : '#B45309' },
      danger:  { bg: isDark ? '#2E0A07' : '#FEE4E2', border: isDark ? 'rgba(240,68,56,.4)'   : '#F04438', color: isDark ? '#F04438' : '#B42318' }
    };
    var c = palette[type] || palette.info;

    var toast = document.createElement('div');
    Object.assign(toast.style, {
      background: c.bg,
      border: '1px solid ' + c.border,
      color: c.color,
      borderRadius: '10px',
      padding: '12px 16px',
      fontSize: '14px',
      fontFamily: "var(--font-family-base, 'Source Sans 3', sans-serif)",
      fontWeight: '600',
      boxShadow: '0 8px 24px rgba(0,0,0,.15)',
      maxWidth: '340px',
      pointerEvents: 'auto',
      opacity: '0',
      transform: 'translateY(8px) scale(.96)',
      transition: 'opacity .2s ease, transform .2s ease'
    });
    toast.textContent = msg;
    container.appendChild(toast);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0) scale(1)';
      });
    });

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px) scale(.96)';
      setTimeout(function () { toast.remove(); }, 220);
    }, duration);

    emit(document, 'bhds:toast:show', { message: msg, type: type });
    return toast;
  }

  /* =========================================
     PLUGIN REGISTRY
     ========================================= */
  var _plugins = [];

  /* =========================================
     PUBLIC BHDS OBJECT
     ========================================= */
  var BHDS = {

    version: '1.0.0',

    /* --- Plugin system --- */
    use: function (plugin) {
      if (plugin && typeof plugin.install === 'function' && !_plugins.includes(plugin)) {
        _plugins.push(plugin);
        plugin.install(BHDS);
      }
      return BHDS;
    },

    /* --- Initialise all modules --- */
    init: function () {
      initTheme();
      initSidebar();
      initActiveNav();
      initCopy();
      initAnchors();
      initTabs();
      initAccordion();
      initModals();
      initProgressDemo();
      initSwatchCopy();
      return BHDS;
    },

    /* --- Individual initialisers (public) --- */
    initTheme:       initTheme,
    initSidebar:     initSidebar,
    initActiveNav:   initActiveNav,
    initCopy:        initCopy,
    initAnchors:     initAnchors,
    initTabs:        initTabs,
    initAccordion:   initAccordion,
    initModals:      initModals,
    initProgressDemo: initProgressDemo,
    initSwatchCopy:  initSwatchCopy,

    /* --- Theme API --- */
    setTheme: function (theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);
      emit(document, 'bhds:theme:change', { theme: theme });
      return BHDS;
    },
    getTheme: function () {
      return document.documentElement.getAttribute('data-theme') || 'light';
    },
    toggleTheme: function () {
      return BHDS.setTheme(BHDS.getTheme() === 'dark' ? 'light' : 'dark');
    },

    /* --- Modal API --- */
    openModal: function (id, el) {
      var modal = el || (id ? document.getElementById(id) : null);
      if (!modal) return BHDS;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      emit(modal, 'bhds:modal:open', { id: id });
      return BHDS;
    },
    closeModal: function (id, el) {
      var modal = el || (id ? document.getElementById(id) : null);
      if (!modal) return BHDS;
      modal.style.display = 'none';
      document.body.style.overflow = '';
      emit(modal, 'bhds:modal:close', { id: id });
      return BHDS;
    },
    closeAllModals: function () {
      $$('.modal-backdrop').forEach(function (b) { BHDS.closeModal(b.id || null, b); });
      return BHDS;
    },

    /* --- Tab API --- */
    activateTab: function (containerEl, index) {
      if (!containerEl) return BHDS;
      var triggers = $$('[data-tab-trigger]', containerEl);
      if (triggers[index]) triggers[index].click();
      return BHDS;
    },

    /* --- Accordion API --- */
    openAccordion: function (itemEl) {
      if (!itemEl) return BHDS;
      var btn = itemEl.querySelector('[data-accordion-trigger]');
      if (btn && !itemEl.hasAttribute('data-open')) btn.click();
      return BHDS;
    },
    closeAccordion: function (itemEl) {
      if (!itemEl) return BHDS;
      var btn = itemEl.querySelector('[data-accordion-trigger]');
      if (btn && itemEl.hasAttribute('data-open')) btn.click();
      return BHDS;
    },

    /* --- Toast API --- */
    toast: showToast,
  };

  /* Expose showToast globally (backwards-compat with main.js) */
  if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.BHDS     = BHDS;
  }

  /* Auto-init on DOMContentLoaded */
  ready(function () { BHDS.init(); });

  return BHDS;
}));
