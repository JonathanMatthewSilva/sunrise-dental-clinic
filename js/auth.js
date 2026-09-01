/* ==========================================================================
   auth.js - Login / logout screen behaviour and UI-level session state
   --------------------------------------------------------------------------
   IMPORTANT: authentication is performed entirely by the Java backend
   (POST /api/auth/login). No credentials are validated here - the checks
   below only stop empty submissions for user convenience.

   sessionStorage is used ONLY to remember the display name/role of the
   signed-in user so the interface can be rendered. It is not a session
   store and it is not a database; the authoritative session lives in the
   Java backend (JSESSIONID cookie / token).
   ========================================================================== */

const Auth = (function () {
  "use strict";

  const KEY = "sdc.currentUser.display";

  function saveUser(user) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(user));
    } catch (e) {
      /* ignore */
    }
  }

  function currentUser() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function clearUser() {
    try {
      sessionStorage.removeItem(KEY);
    } catch (e) {
      /* ignore */
    }
  }

  function requireSession() {
    const user = currentUser();

    if (!user) {
      window.location.replace("login.html");
      return null;
    }

    return user;
  }

  function initLoginPage() {
    const form = document.getElementById("login-form");

    if (!form) {
      return;
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      UI.clearFieldErrors(form);
      UI.clearAlert("login-alert");

      const username = document
        .getElementById("username")
        .value
        .trim();

      const password =
        document.getElementById("password").value;

      const button =
        document.getElementById("login-btn");

      let valid = true;

      if (!username) {
        UI.setFieldError(
          "username",
          "Please enter your username."
        );
        valid = false;
      }

      if (!password) {
        UI.setFieldError(
          "password",
          "Please enter your password."
        );
        valid = false;
      }

      if (!valid) {
        return;
      }

      UI.setBusy(button, true, "Signing in…");

      try {
        const user = await Api.login({
          username: username,
          password: password
        });

        saveUser({
          username: user.username || username,
          fullName: user.fullName || username,
          role: user.role || "Clinic Staff"
        });

        window.location.href = "dashboard.html";
      } catch (error) {
        UI.showAlert(
          "login-alert",
          "error",
          "<strong>Sign-in failed.</strong>&nbsp;" +
            UI.escapeHtml(error.message)
        );

        UI.setBusy(button, false);

        document.getElementById("password").value = "";
        document.getElementById("password").focus();
      }
    });
  }

  async function logout(skipConfirm) {
    if (!skipConfirm) {
      const ok = await UI.confirm({
        title: "Log out of the system?",
        message:
          "You will be returned to the sign-in screen. Any unsaved form data will be lost.",
        confirmText: "Log out",
        cancelText: "Stay signed in"
      });

      if (!ok) {
        return;
      }
    }

    try {
      await Api.logout();
    } catch (error) {
      console.warn(
        "Logout request failed:",
        error.message
      );
    }

    clearUser();
    window.location.replace("login.html");
  }

  function bindLogoutButtons() {
    ["nav-logout", "topbar-logout"].forEach(
      function (id) {
        const el = document.getElementById(id);

        if (el) {
          el.addEventListener(
            "click",
            function (e) {
              e.preventDefault();
              logout(false);
            }
          );
        }
      }
    );
  }

  return {
    initLoginPage: initLoginPage,
    requireSession: requireSession,
    currentUser: currentUser,
    bindLogoutButtons: bindLogoutButtons,
    logout: logout
  };
})();

window.Auth = Auth;

document.addEventListener(
  "DOMContentLoaded",
  function () {
    Auth.initLoginPage();
  }
);