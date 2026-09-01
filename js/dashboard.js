/* ==========================================================================
   dashboard.js - Dashboard screen
   Loads summary counters and recent appointments from the Java REST API
   and renders them.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const user = Auth.requireSession();

    if (!user) {
      return;
    }

    UI.renderShell("dashboard", user);
    Auth.bindLogoutButtons();

    const greeting = document.getElementById("greeting");

    if (greeting) {
      greeting.textContent =
        "Welcome back, " +
        (user.fullName.split(" ")[0] || "there") +
        ".";
    }

    loadSummary();
  });

  async function loadSummary() {
    const recent =
      document.getElementById("recent-body");

    if (recent) {
      recent.innerHTML =
        '<tr><td colspan="7">' +
        UI.loadingRow() +
        "</td></tr>";
    }

    try {
      const data =
        await Api.getDashboardSummary();

      renderStats(data);
      renderRecent(
        data.recentAppointments || []
      );
    } catch (error) {
      UI.showAlert(
        "dashboard-alert",
        "error",
        "<strong>Could not load dashboard data.</strong>&nbsp;" +
          UI.escapeHtml(error.message)
      );

      if (recent) {
        recent.innerHTML =
          '<tr><td colspan="7">' +
          UI.emptyState(
            "No data available",
            "The dashboard could not reach the clinic server."
          ) +
          "</td></tr>";
      }

      [
        "stat-appointments",
        "stat-patients",
        "stat-dentists",
        "stat-revenue"
      ].forEach(function (id) {
        const el =
          document.getElementById(id);

        if (el) {
          el.textContent = "—";
        }
      });
    }
  }

  function renderStats(d) {
    setText(
      "stat-appointments",
      d.todayAppointments
    );

    setText(
      "stat-patients",
      d.registeredPatients
    );

    setText(
      "stat-dentists",
      d.availableDentists
    );

    setText(
      "stat-revenue",
      UI.money(
        d.revenueToday,
        "LKR"
      )
    );

    setText(
      "note-dentists",
      (d.availableDentists || 0) +
        " dentist(s) active today"
    );

    setText(
      "note-revenue",
      "Revenue recorded today"
    );
  }

  function setText(id, value) {
    const el =
      document.getElementById(id);

    if (el) {
      el.textContent =
        value === undefined ||
        value === null
          ? "—"
          : value;
    }
  }

  function formatAppointmentDate(value) {
    if (!value) {
      return "—";
    }

    if (
      typeof value === "string" &&
      value.indexOf("T") === -1
    ) {
      return UI.prettyDate(value);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }

  function renderRecent(list) {
    const body =
      document.getElementById(
        "recent-body"
      );

    if (!body) {
      return;
    }

    if (!list.length) {
      body.innerHTML =
        '<tr><td colspan="7">' +
        UI.emptyState(
          "No recent appointments",
          "Newly registered appointments will appear here."
        ) +
        "</td></tr>";

      return;
    }

    body.innerHTML = list
      .map(function (a) {
        return (
          "<tr>" +
          '<td class="mono nowrap">' +
          UI.escapeHtml(
            a.appointmentNumber
          ) +
          "</td>" +
          "<td>" +
          UI.escapeHtml(
            a.patientName
          ) +
          "</td>" +
          "<td>" +
          UI.escapeHtml(
            a.dentistName
          ) +
          "</td>" +
          "<td>" +
          UI.escapeHtml(
            a.treatmentType
          ) +
          "</td>" +
          '<td class="nowrap">' +
          formatAppointmentDate(
            a.appointmentDate
          ) +
          "</td>" +
          '<td class="nowrap">' +
          UI.prettyTime(
            a.appointmentTime
          ) +
          "</td>" +
          "<td>" +
          UI.statusBadge(
            a.status
          ) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }
})();