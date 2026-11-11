// Shared by the shell and its same-origin learning modules.
(() => {
  function apply(theme) {
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
  }
  try { apply(localStorage.getItem('blessing-theme')); } catch { apply('light'); }
  window.addEventListener('storage', (event) => {
    if (event.key === 'blessing-theme') apply(event.newValue);
  });
  window.addEventListener('message', (event) => {
    if (event.origin === location.origin && event.data?.type === 'blessing:theme') apply(event.data.theme);
  });
})();
