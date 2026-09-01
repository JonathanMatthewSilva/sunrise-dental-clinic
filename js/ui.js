/* ==========================================================================
   ui.js - Shared user-interface utilities
   --------------------------------------------------------------------------
   Pure presentation code: renders the sidebar/top bar shell, toasts,
   confirmation dialogues, status badges, validation helpers and formatting.
   No business logic and no API calls live in this file.
   ========================================================================== */

const UI = (function () {
  "use strict";

  /* ---------------------------- Icons (inline SVG) --------------------- */
  const icon = {
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
    calendar:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
    billing:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>',
    reports:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    help:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.6"/><path d="M12 17h.01"/></svg>',
    logout:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
    users:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"/><circle cx="9.5" cy="8" r="3.5"/><path d="M21 20v-1a4 4 0 0 0-3-3.8"/></svg>',
    tooth:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c-2-1.6-5-1.7-6.4-.2C4 6.5 4.4 9 5 11c.6 2 .7 4.3 1 6.4.2 1.4.6 2.6 1.6 2.6 1.2 0 1.4-1.6 1.8-3.4.3-1.4.7-2.6 2.6-2.6s2.3 1.2 2.6 2.6c.4 1.8.6 3.4 1.8 3.4 1 0 1.4-1.2 1.6-2.6.3-2.1.4-4.4 1-6.4.6-2 1-4.5-.6-6.2C17 3.3 14 3.4 12 5Z"/></svg>',
    money:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>',
    search:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    plus:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
    edit:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    print:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 17h12v4H6z"/></svg>',
    inbox:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h5l2 3h4l2-3h5"/><path d="M5 5h14l2 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z"/></svg>',
    menu:      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };

  /* ---------------------------- Navigation model ----------------------- */
  const navItems = [
    { key: "dashboard",    href: "dashboard.html",    label: "Dashboard",    icon: icon.dashboard },
    { key: "appointments", href: "appointments.html", label: "Appointments", icon: icon.calendar },
    { key: "billing",      href: "billing.html",      label: "Billing",      icon: icon.billing },
    { key: "reports",      href: "reports.html",      label: "Reports",      icon: icon.reports },
    { key: "help",         href: "help.html",         label: "Help",         icon: icon.help }
  ];

  const pageMeta = {
    dashboard:    { title: "Dashboard",           sub: "Clinic overview for today" },
    appointments: { title: "Appointment Manager", sub: "Register, search, update and cancel bookings" },
    billing:      { title: "Billing & Receipts",  sub: "Generate patient bills and print receipts" },
    reports:      { title: "Reports",             sub: "Appointment and revenue analysis" },
    help:         { title: "Help & User Guide",   sub: "Step-by-step instructions for clinic staff" }
  };

  /* ---------------------------- Shell rendering ------------------------ */
  function renderShell(activeKey, user) {
    const sidebar = document.getElementById("sidebar");
    const topbar = document.getElementById("topbar");
    const meta = pageMeta[activeKey] || { title: "Sunrise Dental", sub: "" };

    if (sidebar) {
      sidebar.className = "sidebar";
      sidebar.innerHTML =
        '<div class="brand">' +
          '<div class="brand-mark">SD</div>' +
          '<div class="brand-text"><strong>Sunrise Dental</strong><span>Clinic System</span></div>' +
        '</div>' +
        '<nav class="nav">' +
          '<div class="nav-label">Main</div>' +
          navItems.slice(0, 4).map(function (i) { return navLink(i, activeKey); }).join("") +
          '<div class="nav-label">Support</div>' +
          navLink(navItems[4], activeKey) +
          '<a href="#" class="nav-item" id="nav-logout">' + icon.logout + 'Logout</a>' +
        '</nav>' +
        '<div class="sidebar-foot">Sunrise Dental Clinic<br>Colombo 05 &middot; v1.0</div>';
    }

    if (topbar) {
      topbar.className = "topbar";
      topbar.innerHTML =
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<button class="mobile-toggle" id="menu-toggle" aria-label="Toggle navigation">' + icon.menu + '</button>' +
          '<div class="topbar-title"><strong>' + meta.title + '</strong><span>' + meta.sub + '</span></div>' +
        '</div>' +
        '<div class="topbar-right">' +
          '<span class="small muted nowrap" id="today-label"></span>' +
          '<div class="user-chip">' +
            '<div class="avatar">' + initials(user && user.fullName) + '</div>' +
            '<div class="u-meta"><div class="u-name">' + escapeHtml((user && user.fullName) || "Clinic Staff") + '</div>' +
            '<div class="u-role">' + escapeHtml((user && user.role) || "Staff") + '</div></div>' +
          '</div>' +
          '<button class="btn btn-secondary btn-sm" id="topbar-logout">' + icon.logout + 'Logout</button>' +
        '</div>';

      const todayLabel = document.getElementById("today-label");
      if (todayLabel) todayLabel.textContent = longDate(new Date());
    }

    bindMobileNav();
    ensureToastStack();
  }

  function navLink(item, activeKey) {
    return '<a href="' + item.href + '" class="nav-item' + (item.key === activeKey ? " active" : "") + '">' +
      item.icon + item.label + '</a>';
  }

  function bindMobileNav() {
    const toggle = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");
    if (!toggle || !sidebar) return;
    toggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
      let scrim = document.querySelector(".scrim");
      if (sidebar.classList.contains("open")) {
        scrim = document.createElement("div");
        scrim.className = "scrim";
        scrim.addEventListener("click", function () {
          sidebar.classList.remove("open");
          scrim.remove();
        });
        document.body.appendChild(scrim);
      } else if (scrim) {
        scrim.remove();
      }
    });
  }

  /* ---------------------------- Toasts --------------------------------- */
  function ensureToastStack() {
    if (!document.getElementById("toast-stack")) {
      const el = document.createElement("div");
      el.id = "toast-stack";
      el.className = "toast-stack no-print";
      document.body.appendChild(el);
    }
  }

  function toast(message, type) {
    ensureToastStack();
    const stack = document.getElementById("toast-stack");
    const el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.innerHTML = '<div>' + escapeHtml(message) + '</div>';
    stack.appendChild(el);
    setTimeout(function () { el.remove(); }, 4200);
  }

  /* ---------------------------- Confirm dialogue ----------------------- */
  function confirmDialog(options) {
    options = options || {};
    return new Promise(function (resolve) {
      const backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop no-print";
      backdrop.innerHTML =
        '<div class="modal" role="dialog" aria-modal="true">' +
          '<div class="modal-body">' +
            '<h3>' + escapeHtml(options.title || "Please confirm") + '</h3>' +
            '<p>' + escapeHtml(options.message || "Do you want to continue?") + '</p>' +
          '</div>' +
          '<div class="modal-foot">' +
            '<button class="btn btn-secondary" data-act="cancel">' + escapeHtml(options.cancelText || "Go back") + '</button>' +
            '<button class="btn ' + (options.danger ? "btn-solid-danger" : "btn-primary") + '" data-act="ok">' +
              escapeHtml(options.confirmText || "Confirm") + '</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(backdrop);
      backdrop.querySelector('[data-act="ok"]').focus();

      function close(result) { backdrop.remove(); resolve(result); }
      backdrop.addEventListener("click", function (e) {
        if (e.target === backdrop) close(false);
        const act = e.target.getAttribute && e.target.getAttribute("data-act");
        if (act === "ok") close(true);
        if (act === "cancel") close(false);
      });
      document.addEventListener("keydown", function esc(e) {
        if (e.key === "Escape") { document.removeEventListener("keydown", esc); close(false); }
      });
    });
  }

  /* ---------------------------- Alerts & validation -------------------- */
  function showAlert(containerId, type, message) {
    const box = document.getElementById(containerId);
    if (!box) return;
    box.innerHTML = '<div class="alert alert-' + type + '"><div>' + message + '</div></div>';
    box.classList.remove("hidden");
  }

  function clearAlert(containerId) {
    const box = document.getElementById(containerId);
    if (box) { box.innerHTML = ""; box.classList.add("hidden"); }
  }

  /* Client-side validation feedback only - the Java backend re-validates */
  function setFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const field = input.closest(".field");
    if (field) field.classList.add("invalid");
    const err = document.getElementById(inputId + "-error");
    if (err) err.textContent = message;
  }

  function clearFieldErrors(formEl) {
    if (!formEl) return;
    formEl.querySelectorAll(".field.invalid").forEach(function (f) { f.classList.remove("invalid"); });
    formEl.querySelectorAll(".field-error").forEach(function (e) { e.textContent = ""; });
  }

  function setBusy(button, busy, busyText) {
    if (!button) return;
    if (busy) {
      button.dataset.label = button.innerHTML;
      button.innerHTML = '<span class="spinner"></span>' + (busyText || "Please wait…");
      button.disabled = true;
    } else {
      if (button.dataset.label) button.innerHTML = button.dataset.label;
      button.disabled = false;
    }
  }

  /* ---------------------------- Formatting helpers --------------------- */
  /* Display formatting only. All monetary amounts are calculated by the
     Java service layer and are simply rendered here. */
  function money(amount, currency) {
    if (amount === null || amount === undefined || isNaN(amount)) return "—";
    return (currency || "LKR") + " " + Number(amount).toLocaleString("en-LK", {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  function longDate(d) {
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  function prettyDate(iso) {
    if (!iso) return "—";
    const parts = String(iso).split("-");
    if (parts.length !== 3) return iso;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function prettyTime(t) {
    if (!t) return "—";
    const bits = String(t).split(":");
    let h = Number(bits[0]);
    const m = bits[1] || "00";
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + m + " " + suffix;
  }

  function statusBadge(status) {
    const s = String(status || "").toUpperCase();
    const map = {
      CONFIRMED: "badge-confirmed", PENDING: "badge-pending",
      CANCELLED: "badge-cancelled", COMPLETED: "badge-completed"
    };
    const cls = map[s] || "badge-neutral";
    return '<span class="badge ' + cls + '">' + escapeHtml(s.toLowerCase() || "unknown") + '</span>';
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function emptyState(title, message, iconSvg) {
    return '<div class="empty"><div class="empty-icon">' + (iconSvg || icon.inbox) + '</div>' +
      '<h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(message) + '</p></div>';
  }

  function loadingRow(text) {
    return '<div class="loading-row"><span class="spinner"></span>' + escapeHtml(text || "Loading data from the server…") + '</div>';
  }

  /* Shown only when api.js has actually fallen back to preview placeholder data */
  function mockNotice(target) {
    const el = typeof target === "string" ? document.getElementById(target) : target;
    if (!el || !window.Api) return;

    const render = function () {
      el.innerHTML = '<div class="mock-note">Preview mode: the Java REST API is not reachable, ' +
        'so clearly-marked placeholder data is being displayed.</div>';
    };
    if (window.Api.config.mockActive) { render(); return; }
    window.addEventListener("api:mock-used", render, { once: true });
  }

  function todayISO() {
    const d = new Date();
    const p = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  function initials(name) {
    if (!name) return "CS";
    return name.trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }

  return {
    icon: icon,
    renderShell: renderShell,
    toast: toast,
    confirm: confirmDialog,
    showAlert: showAlert,
    clearAlert: clearAlert,
    setFieldError: setFieldError,
    clearFieldErrors: clearFieldErrors,
    setBusy: setBusy,
    money: money,
    prettyDate: prettyDate,
    prettyTime: prettyTime,
    longDate: longDate,
    statusBadge: statusBadge,
    escapeHtml: escapeHtml,
    emptyState: emptyState,
    loadingRow: loadingRow,
    mockNotice: mockNotice,
    todayISO: todayISO
  };
})();

window.UI = UI;
