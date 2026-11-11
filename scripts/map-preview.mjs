import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const window = {};
vm.runInNewContext(await readFile(new URL('web/jiangshan/js/atlas_snapshots.js', root), 'utf8'), { window });
const snapshots = window.ATLAS_SNAPSHOTS;
const key = Object.keys(snapshots).find(k => k.startsWith('s_ming'));
const polities = snapshots[key].polities || [];
const xy = ([lon,lat]) => [(lon - 73) * 9.4, (56 - lat) * 12];
const paths = polities.map(f => {
  const polygons = f.shape?.type === 'Polygon' ? [f.shape.coordinates] : f.shape?.coordinates || [];
  const d = polygons.flatMap(p => p.map(r => r.map((c,i) => `${i ? 'L':'M'}${xy(c).map(n => n.toFixed(1)).join(',')}`).join('')+'Z')).join('');
  return `<path d="${d}" fill="${f.tint || '#c8d4b8'}" fill-opacity=".28" stroke="#7a8f67" stroke-width="1"/>`;
}).join('');
await writeFile(new URL('web/map-preview.svg', root), `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="440" viewBox="0 0 600 440"><rect width="600" height="440" fill="#f5f6ef"/><path d="M0 44H600M0 132H600M0 220H600M0 308H600M0 396H600M60 0V440M180 0V440M300 0V440M420 0V440M540 0V440" stroke="#d5decf" stroke-width=".5"/>${paths}<g fill="#63785d" font-family="sans-serif" font-size="13"><text x="278" y="235">长安</text><text x="381" y="260">应天府</text><text x="350" y="149">北京</text></g><g fill="#ed7545"><circle cx="300" cy="220" r="4"/><circle cx="420" cy="282" r="4"/><circle cx="405" cy="185" r="4"/></g></svg>`);
console.log('Rendered preview from redistributable polity outlines.');
