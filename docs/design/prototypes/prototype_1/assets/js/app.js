// LearnHub — Core App (Sidebar, Theme, Toast, Modal, Layout-Render)
(function () {
  'use strict';

  // ====== THEME ======
  const themeKey = 'lh-theme';
  function applyTheme(t) {
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem(themeKey, t);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = t === 'dark'
        ? '<i data-lucide="sun" class="w-5 h-5"></i>'
        : '<i data-lucide="moon" class="w-5 h-5"></i>';
      if (window.lucide) window.lucide.createIcons();
    }
  }
  window.LH_toggleTheme = function () {
    const cur = localStorage.getItem(themeKey) || 'dark';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  };
  // Initial
  const initTheme = localStorage.getItem(themeKey) || 'dark';
  if (initTheme === 'dark') document.documentElement.classList.add('dark');

  // ====== SIDEBAR ======
  const sbKey = 'lh-sidebar-collapsed';
  function applySidebar(collapsed) {
    const sb = document.getElementById('sidebar');
    if (!sb) return;
    sb.classList.toggle('collapsed', collapsed);
    localStorage.setItem(sbKey, collapsed ? '1' : '0');
  }
  window.LH_toggleSidebar = function () {
    const sb = document.getElementById('sidebar');
    if (!sb) return;
    if (window.innerWidth <= 768) {
      sb.classList.toggle('mobile-open');
    } else {
      const collapsed = !sb.classList.contains('collapsed');
      applySidebar(collapsed);
    }
  };

  // ====== SIDEBAR HTML ======
  const navItems = [
    { href: 'index.html',      icon: 'layout-dashboard', label: 'Dashboard' },
    { href: 'calendar.html',   icon: 'calendar-days',    label: 'Kalender', badge: 5 },
    { href: 'subjects.html',   icon: 'book-open',        label: 'Fächer' },
    { href: 'goals.html',      icon: 'target',           label: 'Lernziele' },
    { href: 'sessions.html',   icon: 'timer',            label: 'Lernsessions' },
    { href: 'flashcards.html', icon: 'layers',           label: 'Karteikarten' },
    { href: 'notes.html',      icon: 'notebook-pen',     label: 'Notizen' },
    { href: 'stats.html',      icon: 'bar-chart-3',      label: 'Statistiken' },
    { href: 'settings.html',   icon: 'settings',         label: 'Einstellungen' }
  ];

  function renderSidebar() {
    const here = (location.pathname.split('/').pop() || 'index.html');
    const isCollapsed = localStorage.getItem(sbKey) === '1';
    return `
<aside id="sidebar" class="sidebar fixed top-0 left-0 h-screen z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col ${isCollapsed ? 'collapsed' : ''}">
  <div class="h-16 flex items-center gap-3 px-5 border-b border-slate-200 dark:border-slate-800">
    <div class="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
      <i data-lucide="graduation-cap" class="w-5 h-5 text-white"></i>
    </div>
    <span class="sidebar-logo-text text-lg font-bold text-slate-900 dark:text-white tracking-tight">LearnHub</span>
  </div>

  <nav class="flex-1 overflow-y-auto p-3 no-scrollbar">
    <p class="sidebar-section-title text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-3 mt-2 mb-2">Navigation</p>
    ${navItems.map(item => `
      <a href="${item.href}" data-label="${item.label}" class="nav-item ${here === item.href ? 'active' : ''}">
        <i data-lucide="${item.icon}" class="w-5 h-5 shrink-0"></i>
        <span class="sidebar-label flex-1">${item.label}</span>
        ${item.badge ? `<span class="badge bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">${item.badge}</span>` : ''}
      </a>
    `).join('')}
  </nav>

  <div class="p-3 border-t border-slate-200 dark:border-slate-800">
    <div class="nav-item bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 cursor-default" data-label="Streak">
      <i data-lucide="flame" class="w-5 h-5 text-orange-500 shrink-0"></i>
      <div class="sidebar-footer-text flex-1 min-w-0">
        <p class="text-xs text-slate-500 dark:text-slate-400">Streak</p>
        <p class="text-sm font-semibold text-slate-900 dark:text-white">${LH_DATA.user.streak} Tage 🔥</p>
      </div>
    </div>
  </div>
</aside>`;
  }

  function renderTopbar(title, subtitle) {
    return `
<header class="sticky top-0 z-30 h-16 glass border-b border-slate-200 dark:border-slate-800 px-5 md:px-8 flex items-center gap-4">
  <button class="btn-ghost" onclick="LH_toggleSidebar()" aria-label="Sidebar umschalten">
    <i data-lucide="panel-left" class="w-5 h-5"></i>
  </button>
  <div class="flex-1 min-w-0">
    <h1 class="text-base md:text-lg font-semibold text-slate-900 dark:text-white truncate">${title}</h1>
    ${subtitle ? `<p class="text-xs text-slate-500 dark:text-slate-400 truncate">${subtitle}</p>` : ''}
  </div>
  <div class="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm w-72">
    <i data-lucide="search" class="w-4 h-4"></i>
    <input class="bg-transparent flex-1 outline-none text-sm" placeholder="Suchen…  (⌘K)">
  </div>
  <button id="theme-toggle" class="btn-ghost" onclick="LH_toggleTheme()" aria-label="Theme">
    <i data-lucide="moon" class="w-5 h-5"></i>
  </button>
  <button class="btn-ghost relative" aria-label="Benachrichtigungen">
    <i data-lucide="bell" class="w-5 h-5"></i>
    <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
  </button>
  <div class="w-9 h-9 rounded-full bg-gradient-primary text-white flex items-center justify-center font-semibold text-sm shrink-0 shadow-md">${LH_DATA.user.avatar}</div>
</header>`;
  }

  // ====== TOAST ======
  window.LH_toast = function (msg, type = 'success') {
    let cont = document.getElementById('toast-container');
    if (!cont) {
      cont = document.createElement('div');
      cont.id = 'toast-container';
      document.body.appendChild(cont);
    }
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const iconMap = { success: 'check-circle-2', warning: 'alert-triangle', danger: 'x-circle', info: 'info' };
    t.innerHTML = `<i data-lucide="${iconMap[type] || 'info'}" class="w-5 h-5 ${type === 'success' ? 'text-emerald-500' : type === 'warning' ? 'text-amber-500' : type === 'danger' ? 'text-red-500' : 'text-indigo-500'}"></i><span>${msg}</span>`;
    cont.appendChild(t);
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      t.style.transition = 'opacity 240ms, transform 240ms';
      t.style.opacity = '0';
      t.style.transform = 'translateX(120%)';
      setTimeout(() => t.remove(), 260);
    }, 3200);
  };

  // ====== MODAL ======
  window.LH_openModal = function (id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  };
  window.LH_closeModal = function (id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  };
  document.addEventListener('click', e => {
    if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('active');
    }
  });

  // ====== LAYOUT INJECT ======
  window.LH_renderLayout = function (opts) {
    const { title, subtitle } = opts || { title: 'LearnHub' };
    const root = document.getElementById('app');
    if (!root) return;

    const inner = root.innerHTML;
    root.innerHTML = `
      ${renderSidebar()}
      <div class="main-wrapper min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        ${renderTopbar(title, subtitle || '')}
        <main class="p-5 md:p-8 fade-up">${inner}</main>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    applyTheme(localStorage.getItem(themeKey) || 'dark');
  };

  // ====== KEY SHORTCUTS ======
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      window.LH_toggleSidebar();
    }
  });

  // close mobile sidebar on link click
  document.addEventListener('click', e => {
    const link = e.target.closest('.nav-item');
    if (link && window.innerWidth <= 768) {
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.remove('mobile-open');
    }
  });

  // helper for color contrast
  window.LH_subjectBadge = function (s) {
    if (!s) return '';
    return `<span class="badge" style="background:${s.color}22;color:${s.color}">${s.name}</span>`;
  };
})();
