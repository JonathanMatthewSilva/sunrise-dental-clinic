/* ==========================================================================
   help.js - Help screen bootstrap
   The help page is static content; it only needs the shared shell,
   the UI-level session guard and the logout binding.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  const user = Auth.requireSession();
  if (!user) return;

  UI.renderShell("help", user);
  Auth.bindLogoutButtons();
});
