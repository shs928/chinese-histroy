(() => {
  const titles = { overview: '探索首页', atlas: '江山时序', history: '帝王谱系', guoxue: '思想源流', shici: '诗词鉴赏', gewu: '格物致知', myth: '神话异志' };
  const themeButton = document.getElementById('hub-theme-toggle');
  function syncTheme() {
    const theme = document.documentElement.dataset.theme || 'light';
    themeButton.setAttribute('aria-label', theme === 'dark' ? '切换浅色主题' : '切换深色主题');
    document.querySelectorAll('iframe').forEach(frame => frame.contentWindow?.postMessage({ type: 'blessing:theme', theme }, location.origin));
  }
  themeButton.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('blessing-theme', theme); } catch { /* session only */ }
    syncTheme();
  });
  document.addEventListener('load', (event) => { if (event.target.tagName === 'IFRAME') syncTheme(); }, true);
  window.addEventListener('atlas:module-change', (event) => {
    const title = titles[event.detail] || '中华历史';
    document.getElementById('hub-current-title').textContent = title;
    document.title = `${title} · 中华历史 · Blessing Hub`;
    document.body.classList.toggle('hub-map-active', event.detail === 'atlas');
    document.getElementById('atlas-frame')?.contentWindow?.postMessage({ type: 'blessing:visibility', visible: event.detail === 'atlas' }, location.origin);
    syncTheme();
  });
  function navigate(module, params = {}) {
    if (!titles[module] || !document.querySelector(`.mega-btn[data-mega="${module}"]`)) return;
    const query = new URLSearchParams({ module, ...params });
    if (module === 'atlas' && !query.has('year')) query.set('year', '-222');
    history.pushState(null, '', `?${query}`);
    activateModule(module);
    const frame = document.getElementById(`${module}-frame`);
    if (frame && Object.keys(params).length) {
      const forward = new URLSearchParams(query); forward.delete('module');
      const url = new URL(frame.src); url.search = forward.toString(); frame.src = url.href;
    }
  }
  document.getElementById('hub-search').addEventListener('submit', event => {
    event.preventDefault();
    const q = new FormData(event.currentTarget).get('q').trim();
    if (q) navigate('atlas', { q });
  });
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || !Array.from(document.querySelectorAll('iframe')).some(frame => frame.contentWindow === event.source)) return;
    if (event.data?.type === 'blessing:navigate') navigate(event.data.module, event.data.params || {});
    if (event.data?.type === 'blessing:map-state' && document.body.classList.contains('hub-map-active')) {
      const url = new URL(location.href);
      url.search = new URLSearchParams({ module: 'atlas', ...event.data.params }).toString();
      history.replaceState(null, '', url);
    }
  });
  window.addEventListener('popstate', () => {
    const module = new URLSearchParams(location.search).get('module') || 'overview';
    if (titles[module]) { activateModule(module); applyDeepLink(); }
  });
  // Link every emperor's reign to the integrated chronological map.
  const observer = new MutationObserver(() => {
    const detail = document.getElementById('emperor-detail');
    if (!detail || detail.classList.contains('hidden') || detail.querySelector('.hub-era-link')) return;
    const selected = document.querySelector('.emp-card.active .reign');
    const match = selected?.textContent.match(/-?\d{3,4}/);
    if (!match) return;
    const year = match[0];
    const link = document.createElement('a');
    link.className = 'hub-era-link'; link.href = `?module=atlas&year=${year}`;
    link.textContent = `在江山时序中查看这一时代 ↗`;
    link.addEventListener('click', event => { event.preventDefault(); navigate('atlas', { year }); });
    detail.prepend(link);
  });
  observer.observe(document.getElementById('emperor-detail'), { childList: true, attributes: true });
  syncTheme();
})();
