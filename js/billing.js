/* ==========================================================================
   billing.js - Billing screen and printable receipt
   --------------------------------------------------------------------------
   IMPORTANT: no monetary value is ever calculated here. The consultation
   fee, treatment fee and total amount are read directly from the JSON
   returned by the Java service layer (POST/GET /api/bills/{appointmentNo}).
   JavaScript only formats and displays them.
   ========================================================================== */

(function () {
  "use strict";

  let currentBill = null;
  let currentAppointment = null;

  document.addEventListener("DOMContentLoaded", function () {
    const user = Auth.requireSession();
    if (!user) return;

    UI.renderShell("billing", user);
    Auth.bindLogoutButtons();
    UI.mockNotice("env-note");

    document
      .getElementById("bill-search-form")
      .addEventListener("submit", function (event) {
        event.preventDefault();

        loadAppointment(
          document
            .getElementById("bill-number")
            .value
            .trim()
        );
      });

    document
      .getElementById("generate-bill-btn")
      .addEventListener(
        "click",
        generateBill
      );

    document
      .getElementById("print-receipt-btn")
      .addEventListener(
        "click",
        function () {
          window.print();
        }
      );

    const issuedBy =
      document.getElementById(
        "receipt-issuedby"
      );

    if (issuedBy) {
      issuedBy.textContent =
        user.fullName;
    }

    const no =
      new URLSearchParams(
        window.location.search
      ).get("no");

    if (no) {
      document.getElementById(
        "bill-number"
      ).value = no;

      loadAppointment(no);
    }
  });

  async function loadAppointment(number) {
    const summary =
      document.getElementById(
        "bill-summary"
      );

    const empty =
      document.getElementById(
        "bill-empty"
      );

    UI.clearAlert("bill-alert");
    resetFees();

    if (!number) {
      UI.setFieldError(
        "bill-number",
        "Enter the appointment number printed on the patient slip."
      );

      return;
    }

    UI.clearFieldErrors(
      document.getElementById(
        "bill-search-form"
      )
    );

    summary.classList.add("hidden");
    empty.classList.remove("hidden");

    empty.innerHTML =
      UI.loadingRow(
        "Retrieving appointment " +
          number +
          "…"
      );

    try {
      const appointment =
        await Api.getAppointment(
          number
        );

      currentAppointment =
        appointment;

      renderAppointmentSummary(
        appointment
      );

      summary.classList.remove(
        "hidden"
      );

      empty.classList.add(
        "hidden"
      );

      document.getElementById(
        "generate-bill-btn"
      ).disabled = false;

      document.getElementById(
        "print-receipt-btn"
      ).disabled = true;

      document.getElementById(
        "receipt-wrap"
      ).classList.add("hidden");

      if (
        String(
          appointment.status
        ).toUpperCase() ===
        "CANCELLED"
      ) {
        UI.showAlert(
          "bill-alert",
          "warn",
          "<strong>This appointment is cancelled.</strong>&nbsp;A bill can normally not be issued for cancelled bookings."
        );
      }
    } catch (error) {
      currentAppointment = null;

      summary.classList.add(
        "hidden"
      );

      empty.classList.remove(
        "hidden"
      );

      empty.innerHTML =
        UI.emptyState(
          error.status === 404
            ? "No appointment found"
            : "Unable to load appointment",
          error.status === 404
            ? 'No record matches "' +
                number +
                '". Please check the number and search again.'
            : error.message,
          UI.icon.search
        );

      document.getElementById(
        "generate-bill-btn"
      ).disabled = true;
    }
  }

  function renderAppointmentSummary(a) {
    setText(
      "sum-number",
      a.appointmentNumber
    );

    setText(
      "sum-patient",
      a.patientName
    );

    setText(
      "sum-contact",
      a.contactNumber
    );

    setText(
      "sum-address",
      a.address
    );

    setText(
      "sum-dentist",
      a.dentistName
    );

    setText(
      "sum-treatment",
      a.treatmentType
    );

    setText(
      "sum-date",
      UI.prettyDate(
        a.appointmentDate
      )
    );

    setText(
      "sum-time",
      UI.prettyTime(
        a.appointmentTime
      )
    );

    const st =
      document.getElementById(
        "sum-status"
      );

    if (st) {
      st.innerHTML =
        UI.statusBadge(a.status);
    }
  }

  async function generateBill() {
    const number =
      document
        .getElementById(
          "sum-number"
        )
        .textContent
        .trim();

    if (
      !number ||
      number === "—"
    ) {
      return;
    }

    const button =
      document.getElementById(
        "generate-bill-btn"
      );

    UI.setBusy(
      button,
      true,
      "Generating…"
    );

    UI.clearAlert("bill-alert");

    try {
      const bill =
        await Api.generateBill(
          number
        );

      currentBill = bill;

      renderFees(bill);
      renderReceipt(bill);

      document.getElementById(
        "print-receipt-btn"
      ).disabled = false;

      document.getElementById(
        "receipt-wrap"
      ).classList.remove(
        "hidden"
      );

      UI.showAlert(
        "bill-alert",
        "success",
        "<strong>Bill " +
          UI.escapeHtml(
            bill.billNumber || ""
          ) +
          " generated.</strong>&nbsp;The receipt below is ready to print."
      );

      UI.toast(
        "Bill generated for " +
          number +
          ".",
        "success"
      );
    } catch (error) {
      UI.showAlert(
        "bill-alert",
        "error",
        "<strong>Bill could not be generated.</strong>&nbsp;" +
          UI.escapeHtml(
            error.message
          )
      );
    } finally {
      UI.setBusy(
        button,
        false
      );
    }
  }

  function renderFees(bill) {
    setText(
      "fee-consultation",
      UI.money(
        bill.consultationFee,
        bill.currency
      )
    );

    setText(
      "fee-treatment",
      UI.money(
        bill.treatmentFee,
        bill.currency
      )
    );

    setText(
      "fee-total",
      UI.money(
        bill.totalAmount,
        bill.currency
      )
    );

    setText(
      "fee-billno",
      bill.billNumber || "—"
    );

    const status =
      document.getElementById(
        "fee-paystatus"
      );

    if (status) {
      status.innerHTML =
        UI.statusBadge(
          bill.paymentStatus ||
            "PENDING"
        );
    }
  }

  function resetFees() {
    [
      "fee-consultation",
      "fee-treatment",
      "fee-total",
      "fee-billno"
    ].forEach(function (id) {
      setText(id, "—");
    });

    const status =
      document.getElementById(
        "fee-paystatus"
      );

    if (status) {
      status.innerHTML =
        '<span class="badge badge-neutral">not billed</span>';
    }

    document.getElementById(
      "receipt-wrap"
    ).classList.add(
      "hidden"
    );

    document.getElementById(
      "print-receipt-btn"
    ).disabled = true;

    currentBill = null;
  }

  function renderReceipt(bill) {
    setText(
      "receipt-billno",
      bill.billNumber || "—"
    );

    setText(
      "receipt-apptno",
      bill.appointmentNumber ||
        "—"
    );

    setText(
      "receipt-patient",
      bill.patientName || "—"
    );

    setText(
      "receipt-contact",
      bill.contactNumber || "—"
    );

    setText(
      "receipt-address",
      bill.address || "—"
    );

    setText(
      "receipt-dentist",
      bill.dentistName || "—"
    );

    setText(
      "receipt-treatment",
      bill.treatmentType || "—"
    );

    if (currentAppointment) {
      setText(
        "receipt-appt-datetime",
        UI.prettyDate(
          currentAppointment
            .appointmentDate
        ) +
          " at " +
          UI.prettyTime(
            currentAppointment
              .appointmentTime
          )
      );
    } else {
      setText(
        "receipt-appt-datetime",
        "—"
      );
    }

    setText(
      "receipt-generated",
      bill.generatedAt || "—"
    );

    setText(
      "receipt-consultation",
      UI.money(
        bill.consultationFee,
        bill.currency
      )
    );

    setText(
      "receipt-treatment-fee",
      UI.money(
        bill.treatmentFee,
        bill.currency
      )
    );

    setText(
      "receipt-total",
      UI.money(
        bill.totalAmount,
        bill.currency
      )
    );

    setText(
      "receipt-paystatus",
      bill.paymentStatus || "—"
    );

    if (bill.issuedBy) {
      setText(
        "receipt-issuedby",
        bill.issuedBy
      );
    }
  }

  function setText(id, value) {
    const el =
      document.getElementById(id);

    if (el) {
      el.textContent =
        value === undefined ||
        value === null ||
        value === ""
          ? "—"
          : value;
    }
  }
})();