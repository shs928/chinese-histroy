// SPDX-License-Identifier: GPL-3.0-or-later
(() => {
  // The original source contains a separate, non-redistributable prefecture layer.
  // Only the already sanitized polity / first-level-region data is shipped here.
  window.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('chk-prefectures');
    if (toggle) { toggle.checked = false; toggle.disabled = true; toggle.closest('label')?.setAttribute('hidden', ''); }
    const app = window.atlasApp;
    if (!app) return;
    // A same-origin shell can preserve map state without polling or external traffic.
    function sync() {
      const params = Object.fromEntries(new URLSearchParams(location.search));
      params.year = String(app.year);
      if (window.parent !== window) parent.postMessage({ type: 'blessing:map-state', params }, location.origin);
    }
    const originalReplace = history.replaceState.bind(history);
    history.replaceState = function (...args) { const result = originalReplace(...args); sync(); return result; };
    window.addEventListener('message', event => {
      if (event.origin !== location.origin || event.source !== parent) return;
      if (event.data?.type === 'blessing:visibility' && !event.data.visible) {
        app.stopAutoplay?.(); app.stopPersonPlayback?.();
        document.querySelectorAll('audio').forEach(audio => audio.pause());
      }
    });
    sync();
  });
})();
