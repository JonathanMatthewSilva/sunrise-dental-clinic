(function () {
  "use strict";

  let dentists = [];
  let treatments = [];

  document.addEventListener("DOMContentLoaded", function () {
    const user = Auth.requireSession();
    if (!user) return;

    UI.renderShell("appointments", user);
    Auth.bindLogoutButtons();
    UI.mockNotice("env-note");

    initTabs();
    loadReferenceData();
    bindRegisterForm();
    bindSearchForm();
    bindManageForms();

    const today = UI.todayISO();
    const regDate = document.getElementById("reg-date");

    if (regDate) {
      regDate.min = today;
      regDate.value = today;
    }

    const params = new URLSearchParams(window.location.search);

    if (params.get("tab")) {
      activateTab(params.get("tab"));
    }

    if (params.get("no")) {
      const tab = params.get("tab") === "manage" ? "manage" : "search";
      const input = document.getElementById(
        tab === "manage" ? "manage-number" : "search-number"
      );

      if (input) {
        input.value = params.get("no");
      }

      if (tab === "manage") {
        loadForEditing(params.get("no"));
      } else {
        runSearch(params.get("no"));
      }
    }
  });

  function initTabs() {
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        activateTab(tab.dataset.tab);
      });
    });
  }

  function activateTab(key) {
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.classList.toggle("active", tab.dataset.tab === key);
    });

    document.querySelectorAll(".tab-panel").forEach(function (panel) {
      panel.classList.toggle("hidden", panel.dataset.panel !== key);
    });
  }

  async function loadReferenceData() {
    try {
      const results = await Promise.all([
        Api.getDentists(),
        Api.getTreatments()
      ]);

      dentists = results[0] || [];
      treatments = results[1] || [];
    } catch (error) {
      UI.toast(
        "Dentist/treatment lists could not be loaded: " + error.message,
        "warn"
      );
    }

    fillSelect(
      "reg-dentist",
      dentists,
      "dentistId",
      function (dentist) {
        return dentist.name + " — " + dentist.specialization;
      }
    );

    fillSelect(
      "upd-dentist",
      dentists,
      "dentistId",
      function (dentist) {
        return dentist.name + " — " + dentist.specialization;
      }
    );

    fillSelect(
      "reg-treatment",
      treatments,
      "treatmentCode",
      function (treatment) {
        return treatment.name;
      }
    );

    fillSelect(
      "upd-treatment",
      treatments,
      "treatmentCode",
      function (treatment) {
        return treatment.name;
      }
    );
  }

  function fillSelect(id, items, valueKey, labelFunction) {
    const select = document.getElementById(id);

    if (!select) return;

    const placeholder = select.dataset.placeholder || "Select an option";

    select.innerHTML =
      '<option value="">' +
      placeholder +
      "</option>" +
      items
        .map(function (item) {
          return (
            '<option value="' +
            UI.escapeHtml(item[valueKey]) +
            '">' +
            UI.escapeHtml(labelFunction(item)) +
            "</option>"
          );
        })
        .join("");
  }

  function validateAppointmentForm(prefix, formElement) {
    UI.clearFieldErrors(formElement);

    let valid = true;

    const rules = [
      {
        id: prefix + "-patientName",
        test: function (value) {
          return value.length >= 3;
        },
        msg: "Enter the patient's full name (minimum 3 characters)."
      },
      {
        id: prefix + "-address",
        test: function (value) {
          return value.length >= 5;
        },
        msg: "Enter the patient's address."
      },
      {
        id: prefix + "-contact",
        test: function (value) {
          return /^0\d{9}$/.test(value.replace(/[\s-]/g, ""));
        },
        msg: "Enter a 10-digit contact number, e.g. 0771234567."
      },
      {
        id: prefix + "-dentist",
        test: function (value) {
          return !!value;
        },
        msg: "Select a dentist."
      },
      {
        id: prefix + "-treatment",
        test: function (value) {
          return !!value;
        },
        msg: "Select a treatment type."
      },
      {
        id: prefix + "-date",
        test: function (value) {
          return !!value;
        },
        msg: "Choose an appointment date."
      },
      {
        id: prefix + "-time",
        test: function (value) {
          return !!value;
        },
        msg: "Choose an appointment time."
      }
    ];

    rules.forEach(function (rule) {
      const element = document.getElementById(rule.id);

      if (!element) return;

      if (!rule.test(String(element.value).trim())) {
        UI.setFieldError(rule.id, rule.msg);
        valid = false;
      }
    });

    const time = document.getElementById(prefix + "-time");

    if (
      time &&
      time.value &&
      (time.value < "08:00" || time.value > "19:30")
    ) {
      UI.setFieldError(
        prefix + "-time",
        "The clinic operates between 08:00 and 19:30."
      );

      valid = false;
    }

    return valid;
  }

  function readForm(prefix) {
    const value = function (id) {
      return String(
        document.getElementById(prefix + "-" + id).value
      ).trim();
    };

    return {
      patientName: value("patientName"),
      address: value("address"),
      contactNumber: value("contact").replace(/[\s-]/g, ""),
      dentistId: value("dentist"),
      treatmentCode: value("treatment"),
      appointmentDate: value("date"),
      appointmentTime: value("time")
    };
  }

  function bindRegisterForm() {
    const form = document.getElementById("register-form");

    if (!form) return;

    form.addEventListener("reset", function () {
      UI.clearFieldErrors(form);
      UI.clearAlert("register-alert");

      document
        .getElementById("register-success")
        .classList.add("hidden");

      const regDate = document.getElementById("reg-date");

      setTimeout(function () {
        if (regDate) {
          regDate.value = UI.todayISO();
        }
      }, 0);
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      UI.clearAlert("register-alert");

      document
        .getElementById("register-success")
        .classList.add("hidden");

      if (!validateAppointmentForm("reg", form)) {
        UI.showAlert(
          "register-alert",
          "warn",
          "Please correct the highlighted fields before submitting."
        );

        return;
      }

      const button = document.getElementById("register-btn");

      UI.setBusy(button, true, "Saving…");

      try {
        const created = await Api.createAppointment(
          readForm("reg")
        );

        document.getElementById("created-number").textContent =
          created.appointmentNumber || "—";

        document.getElementById("created-summary").innerHTML =
          UI.escapeHtml(created.patientName) +
          " with " +
          UI.escapeHtml(
            created.dentistName || "the selected dentist"
          ) +
          " on " +
          UI.prettyDate(created.appointmentDate) +
          " at " +
          UI.prettyTime(created.appointmentTime) +
          ".";

        document
          .getElementById("register-success")
          .classList.remove("hidden");

        document
          .getElementById("register-success")
          .scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

        const billLink =
          document.getElementById("created-bill-link");

        if (billLink) {
          billLink.href =
            "billing.html?no=" +
            encodeURIComponent(created.appointmentNumber);
        }

        form.reset();

        document.getElementById("reg-date").value =
          UI.todayISO();

        UI.toast(
          "Appointment " +
            created.appointmentNumber +
            " created.",
          "success"
        );
      } catch (error) {
        UI.showAlert(
          "register-alert",
          "error",
          "<strong>Appointment not created.</strong>&nbsp;" +
            UI.escapeHtml(error.message)
        );
      } finally {
        UI.setBusy(button, false);
      }
    });
  }

  function bindSearchForm() {
    const form = document.getElementById("search-form");

    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      runSearch(
        document
          .getElementById("search-number")
          .value.trim()
      );
    });
  }

  async function runSearch(number) {
    const result =
      document.getElementById("search-result");

    if (!result) return;

    if (!number) {
      UI.setFieldError(
        "search-number",
        "Enter an appointment number, e.g. APT-2026-0143."
      );

      return;
    }

    UI.clearFieldErrors(
      document.getElementById("search-form")
    );

    result.innerHTML =
      UI.loadingRow("Searching the clinic records…");

    try {
      const appointment =
        await Api.getAppointment(number);

      result.innerHTML =
        renderRecordCard(appointment);

      bindRecordActions(appointment);
    } catch (error) {
      if (error.status === 404) {
        result.innerHTML =
          '<div class="card"><div class="card-body">' +
          UI.emptyState(
            "No appointment found",
            'No record matches "' +
              UI.escapeHtml(number) +
              '". Check the appointment number on the patient slip and try again.',
            UI.icon.search
          ) +
          "</div></div>";
      } else {
        result.innerHTML =
          '<div class="alert alert-error"><div><strong>Search failed.</strong> ' +
          UI.escapeHtml(error.message) +
          "</div></div>";
      }
    }
  }

  function renderRecordCard(appointment) {
    const row = function (label, value) {
      return (
        "<div><div class=\"dt\">" +
        label +
        '</div><div class="dd">' +
        value +
        "</div></div>"
      );
    };

    return (
      '<div class="card">' +
      '<div class="card-head">' +
      "<div><h2>Appointment " +
      UI.escapeHtml(appointment.appointmentNumber) +
      "</h2>" +
      "<p>Record retrieved from the clinic database</p></div>" +
      UI.statusBadge(appointment.status) +
      "</div>" +
      '<div class="card-body"><div class="dl">' +
      row(
        "Appointment No.",
        '<span class="mono">' +
          UI.escapeHtml(
            appointment.appointmentNumber
          ) +
          "</span>"
      ) +
      row(
        "Patient name",
        UI.escapeHtml(appointment.patientName)
      ) +
      row(
        "Contact number",
        UI.escapeHtml(appointment.contactNumber)
      ) +
      row(
        "Address",
        UI.escapeHtml(appointment.address)
      ) +
      row(
        "Dentist",
        UI.escapeHtml(appointment.dentistName)
      ) +
      row(
        "Treatment",
        UI.escapeHtml(appointment.treatmentType)
      ) +
      row(
        "Date",
        UI.prettyDate(appointment.appointmentDate)
      ) +
      row(
        "Time",
        UI.prettyTime(appointment.appointmentTime)
      ) +
      row(
        "Status",
        UI.statusBadge(appointment.status)
      ) +
      "</div></div>" +
      '<div class="card-foot">' +
      '<button class="btn btn-secondary" id="goto-edit">' +
      UI.icon.edit +
      "Edit this appointment</button>" +
      '<a class="btn btn-secondary" href="billing.html?no=' +
      encodeURIComponent(
        appointment.appointmentNumber
      ) +
      '">' +
      UI.icon.billing +
      "Open billing</a>" +
      '<button class="btn btn-ghost" id="print-record">' +
      UI.icon.print +
      "Print details</button>" +
      "</div></div>"
    );
  }

  function bindRecordActions(appointment) {
    const edit =
      document.getElementById("goto-edit");

    if (edit) {
      edit.addEventListener("click", function () {
        activateTab("manage");

        document.getElementById(
          "manage-number"
        ).value =
          appointment.appointmentNumber;

        loadForEditing(
          appointment.appointmentNumber
        );
      });
    }

    const print =
      document.getElementById("print-record");

    if (print) {
      print.addEventListener("click", function () {
        window.print();
      });
    }
  }

  function bindManageForms() {
    const loadForm =
      document.getElementById("load-form");

    if (loadForm) {
      loadForm.addEventListener(
        "submit",
        function (event) {
          event.preventDefault();

          loadForEditing(
            document
              .getElementById("manage-number")
              .value.trim()
          );
        }
      );
    }

    const updateForm =
      document.getElementById("update-form");

    if (updateForm) {
      updateForm.addEventListener(
        "submit",
        async function (event) {
          event.preventDefault();

          UI.clearAlert("manage-alert");

          if (
            !validateAppointmentForm(
              "upd",
              updateForm
            )
          ) {
            UI.showAlert(
              "manage-alert",
              "warn",
              "Please correct the highlighted fields before updating."
            );

            return;
          }

          const number =
            document.getElementById(
              "upd-number"
            ).value;

          const confirmed = await UI.confirm({
            title:
              "Save changes to " +
              number +
              "?",
            message:
              "The updated details will replace the current record. The system will re-check dentist availability.",
            confirmText: "Save changes"
          });

          if (!confirmed) return;

          const button =
            document.getElementById(
              "update-btn"
            );

          UI.setBusy(
            button,
            true,
            "Updating…"
          );

          try {
            const updated =
              await Api.updateAppointment(
                number,
                readForm("upd")
              );

            fillEditForm(updated);

            UI.showAlert(
              "manage-alert",
              "success",
              "<strong>Appointment updated.</strong>&nbsp;Record " +
                UI.escapeHtml(number) +
                " has been saved."
            );

            UI.toast(
              "Appointment " +
                number +
                " updated.",
              "success"
            );
          } catch (error) {
            UI.showAlert(
              "manage-alert",
              "error",
              "<strong>Update failed.</strong>&nbsp;" +
                UI.escapeHtml(
                  error.message
                )
            );
          } finally {
            UI.setBusy(button, false);
          }
        }
      );
    }

    const cancelButton =
      document.getElementById(
        "cancel-appt-btn"
      );

    if (cancelButton) {
      cancelButton.addEventListener(
        "click",
        async function () {
          const number =
            document.getElementById(
              "upd-number"
            ).value;

          const confirmed =
            await UI.confirm({
              title:
                "Cancel appointment " +
                number +
                "?",
              message:
                "This releases the time slot and marks the booking as cancelled. This action cannot be undone from the front desk.",
              confirmText:
                "Yes, cancel it",
              cancelText:
                "Keep appointment",
              danger: true
            });

          if (!confirmed) return;

          UI.setBusy(
            cancelButton,
            true,
            "Cancelling…"
          );

          try {
            const response =
              await Api.cancelAppointment(
                number
              );

            UI.showAlert(
              "manage-alert",
              "success",
              "<strong>Appointment cancelled.</strong>&nbsp;" +
                UI.escapeHtml(
                  response.message ||
                    (number +
                      " is now cancelled.")
                )
            );

            document.getElementById(
              "manage-status"
            ).innerHTML =
              UI.statusBadge(
                response.status ||
                  "CANCELLED"
              );

            UI.toast(
              "Appointment " +
                number +
                " cancelled.",
              "warn"
            );
          } catch (error) {
            UI.showAlert(
              "manage-alert",
              "error",
              "<strong>Cancellation failed.</strong>&nbsp;" +
                UI.escapeHtml(
                  error.message
                )
            );
          } finally {
            UI.setBusy(
              cancelButton,
              false
            );
          }
        }
      );
    }
  }

  async function loadForEditing(number) {
    const panel =
      document.getElementById(
        "manage-panel"
      );

    const notFound =
      document.getElementById(
        "manage-empty"
      );

    UI.clearAlert("manage-alert");

    if (!number) {
      UI.setFieldError(
        "manage-number",
        "Enter the appointment number you want to modify."
      );

      return;
    }

    UI.clearFieldErrors(
      document.getElementById(
        "load-form"
      )
    );

    try {
      const appointment =
        await Api.getAppointment(number);

      fillEditForm(appointment);

      panel.classList.remove(
        "hidden"
      );

      notFound.classList.add(
        "hidden"
      );
    } catch (error) {
      panel.classList.add(
        "hidden"
      );

      notFound.classList.remove(
        "hidden"
      );

      notFound.innerHTML =
        '<div class="card"><div class="card-body">' +
        UI.emptyState(
          error.status === 404
            ? "No appointment found"
            : "Unable to load record",
          error.status === 404
            ? 'No record matches "' +
                UI.escapeHtml(number) +
                '". Please verify the appointment number.'
            : UI.escapeHtml(error.message),
          UI.icon.search
        ) +
        "</div></div>";
    }
  }

  function fillEditForm(appointment) {
    document.getElementById(
      "upd-number"
    ).value =
      appointment.appointmentNumber;

    document.getElementById(
      "manage-ref"
    ).textContent =
      appointment.appointmentNumber;

    document.getElementById(
      "manage-status"
    ).innerHTML =
      UI.statusBadge(
        appointment.status
      );

    document.getElementById(
      "upd-patientName"
    ).value =
      appointment.patientName || "";

    document.getElementById(
      "upd-address"
    ).value =
      appointment.address || "";

    document.getElementById(
      "upd-contact"
    ).value =
      appointment.contactNumber || "";

    document.getElementById(
      "upd-dentist"
    ).value =
      appointment.dentistId || "";

    document.getElementById(
      "upd-treatment"
    ).value =
      appointment.treatmentCode || "";

    document.getElementById(
      "upd-date"
    ).value =
      appointment.appointmentDate || "";

    document.getElementById(
      "upd-time"
    ).value =
      appointment.appointmentTime || "";
  }
})();