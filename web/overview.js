document.querySelectorAll('[data-module]').forEach(link => link.addEventListener('click', event => {
  if (window.parent === window) return;
  event.preventDefault();
  const params = {};
  if (link.dataset.year) params.year = link.dataset.year;
  if (link.dataset.person) params.person = link.dataset.person;
  parent.postMessage({ type: 'blessing:navigate', module: link.dataset.module, params }, location.origin);
}));
