(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const user = Auth.requireSession();
    if (!user) return;

    UI.renderShell("reports", user);
    Auth.bindLogoutButtons();
    UI.mockNotice("env-note");

    const to = new Date();
    const from = new Date();

    from.setDate(to.getDate() - 6);

    document.getElementById("range-from").value = iso(from);
    document.getElementById("range-to").value = iso(to);

    document
      .getElementById("range-form")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        loadReports();
      });

    document
      .getElementById("print-reports-btn")
      .addEventListener("click", function () {
        window.print();
      });

    loadReports();
  });

  function iso(date) {
    const pad = function (number) {
      return String(number).padStart(2, "0");
    };

    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate())
    );
  }

  function safePrettyDate(value) {
    if (!value) {
      return "—";
    }

    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      return UI.prettyDate(value);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  async function loadReports() {
    const params = {
      from: document.getElementById("range-from").value,
      to: document.getElementById("range-to").value
    };

    if (
      params.from &&
      params.to &&
      params.from > params.to
    ) {
      UI.showAlert(
        "reports-alert",
        "warn",
        "The start date must be earlier than the end date."
      );

      return;
    }

    UI.clearAlert("reports-alert");

    setLoading("by-date-body", 4);
    setLoading("by-dentist-body", 5);
    setLoading("frequency-body", 3);
    setLoading("revenue-body", 3);
    setLoading("revenue-treatment-body", 3);

    try {
      const results = await Promise.all([
        Api.getAppointmentReports(params),
        Api.getRevenueReport(params)
      ]);

      renderAppointmentReports(results[0] || {});
      renderRevenueReport(results[1] || {});

      const stamp =
        document.getElementById("report-stamp");

      if (stamp) {
        stamp.textContent =
          "Report period " +
          safePrettyDate(params.from) +
          " – " +
          safePrettyDate(params.to) +
          " · generated " +
          new Date().toLocaleString("en-GB");
      }
    } catch (error) {
      UI.showAlert(
        "reports-alert",
        "error",
        "<strong>Reports could not be loaded.</strong>&nbsp;" +
          UI.escapeHtml(error.message)
      );

      [
        "by-date-body",
        "by-dentist-body",
        "frequency-body",
        "revenue-body",
        "revenue-treatment-body"
      ].forEach(function (id) {
        const element =
          document.getElementById(id);

        if (element) {
          element.innerHTML =
            '<tr><td colspan="6" class="muted small">' +
            "No data returned by the server." +
            "</td></tr>";
        }
      });
    }
  }

  function setLoading(id, columns) {
    const element =
      document.getElementById(id);

    if (element) {
      element.innerHTML =
        '<tr><td colspan="' +
        columns +
        '">' +
        UI.loadingRow() +
        "</td></tr>";
    }
  }

  function renderAppointmentReports(data) {
    fill(
      "by-date-body",
      data.byDate,
      4,
      function (row) {
        return (
          '<tr><td class="nowrap">' +
          safePrettyDate(row.date) +
          '</td><td class="num">' +
          numberValue(row.total) +
          '</td><td class="num">' +
          numberValue(row.completed) +
          '</td><td class="num">' +
          numberValue(row.cancelled) +
          "</td></tr>"
        );
      }
    );

    fill(
      "by-dentist-body",
      data.byDentist,
      5,
      function (row) {
        return (
          "<tr><td>" +
          UI.escapeHtml(row.dentistName) +
          '</td><td class="muted">' +
          UI.escapeHtml(
            row.specialization || "—"
          ) +
          '</td><td class="num">' +
          numberValue(row.appointments) +
          '</td><td class="num">' +
          numberValue(row.completed) +
          '</td><td class="num">' +
          numberValue(row.cancelled) +
          "</td></tr>"
        );
      }
    );

    const frequency =
      data.treatmentFrequency || [];

    const max =
      frequency.reduce(
        function (highest, row) {
          return Math.max(
            highest,
            Number(row.count) || 0
          );
        },
        0
      ) || 1;

    fill(
      "frequency-body",
      frequency,
      3,
      function (row) {
        const percentage =
          Math.round(
            ((Number(row.count) || 0) /
              max) *
              100
          );

        return (
          "<tr><td>" +
          UI.escapeHtml(
            row.treatmentType
          ) +
          '</td><td><div class="meter"><span style="width:' +
          percentage +
          '%"></span></div></td><td class="num">' +
          numberValue(row.count) +
          "</td></tr>"
        );
      }
    );

    setText(
      "kpi-appointments",
      data.totalAppointments !==
        undefined &&
        data.totalAppointments !== null
        ? data.totalAppointments
        : "—"
    );
  }

  function renderRevenueReport(data) {
    setText(
      "kpi-revenue",
      UI.money(
        data.totalRevenue,
        data.currency
      )
    );

    setText(
      "kpi-bills",
      data.billsIssued !== undefined
        ? data.billsIssued
        : "—"
    );

    setText(
      "kpi-average",
      UI.money(
        data.averageBillValue,
        data.currency
      )
    );

    setText(
      "kpi-outstanding",
      UI.money(
        data.outstanding,
        data.currency
      )
    );

    fill(
      "revenue-body",
      data.byDay,
      3,
      function (row) {
        return (
          '<tr><td class="nowrap">' +
          safePrettyDate(row.date) +
          '</td><td class="num">' +
          numberValue(row.bills) +
          '</td><td class="num">' +
          UI.money(
            row.revenue,
            data.currency
          ) +
          "</td></tr>"
        );
      }
    );

    fill(
      "revenue-treatment-body",
      data.byTreatment,
      3,
      function (row) {
        return (
          "<tr><td>" +
          UI.escapeHtml(
            row.treatmentType
          ) +
          '</td><td class="num">' +
          numberValue(row.bills) +
          '</td><td class="num">' +
          UI.money(
            row.revenue,
            data.currency
          ) +
          "</td></tr>"
        );
      }
    );
  }

  function fill(
    id,
    rows,
    columns,
    rowFunction
  ) {
    const element =
      document.getElementById(id);

    if (!element) return;

    if (!rows || !rows.length) {
      element.innerHTML =
        '<tr><td colspan="' +
        columns +
        '" class="muted small" style="padding:18px">' +
        "No records for the selected period." +
        "</td></tr>";

      return;
    }

    element.innerHTML =
      rows.map(rowFunction).join("");
  }

  function numberValue(value) {
    return value === undefined ||
      value === null
      ? "—"
      : value;
  }

  function setText(id, value) {
    const element =
      document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  }
})();