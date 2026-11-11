// SPDX-License-Identifier: GPL-3.0-or-later
// Import the redistributable runtime only. Never ship the upstream CHGIS layer.
import { readFile, writeFile, mkdir, cp, readdir, copyFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const source = resolve(process.argv[2] || join(root, '..', 'jiangshan-map'));
const target = join(root, 'web', 'jiangshan');
await mkdir(join(target, 'js'), { recursive: true });
function unpack(text) {
  const start = text.indexOf('  const D = ') + '  const D = '.length;
  const end = text.indexOf(';\n  const rc = new Array(D.r.length);', start);
  if (start < 12 || end < 0) throw new Error('Upstream snapshot format changed; inspect before importing.');
  return { start, end, data: JSON.parse(text.slice(start, end)) };
}
const full = unpack(await readFile(join(source, 'js', 'atlas_snapshots.js'), 'utf8'));
function sanitize(text) {
  const { start, end, data } = unpack(text);
  // Features can be aliased as `regions` in the Qin / Warring States seed.
  // Compare canonical decoded shapes because ring indexes differ across bundles.
  const shapeSignature = (data, f) => JSON.stringify(f.shape?._p ? [f.shape._p.map(i => data.r[i])] : f.shape?._m?.map(p => p.map(i => data.r[i])));
  const forbidden = new Set();
  for (const snap of Object.values(full.data.d)) for (const id of snap.prefectures || []) forbidden.add(shapeSignature(full.data, full.data.f[id]));
  const keep = id => !forbidden.has(shapeSignature(data, data.f[id]));
  const featureIds = new Set();
  for (const snap of Object.values(data.d)) {
    if (Array.isArray(snap)) { snap.forEach(id => { if (keep(id)) featureIds.add(id); }); continue; }
    delete snap.prefectures; delete snap.prefRef;
    for (const key of ['polities', 'regions']) if (Array.isArray(snap[key])) {
      snap[key] = snap[key].filter(keep); snap[key].forEach(id => featureIds.add(id));
    }
  }
  const featureMap = new Map([...featureIds].map((id, i) => [id, i]));
  const ringIds = new Set();
  for (const id of featureIds) {
    const shape = data.f[id].shape;
    for (const polygon of shape?._m || (shape?._p ? [shape._p] : [])) polygon.forEach(id => ringIds.add(id));
  }
  const ringMap = new Map([...ringIds].map((id, i) => [id, i]));
  const features = [...featureIds].map(id => {
    const f = data.f[id];
    if (f.shape?._p) f.shape._p = f.shape._p.map(i => ringMap.get(i));
    if (f.shape?._m) f.shape._m = f.shape._m.map(p => p.map(i => ringMap.get(i)));
    return f;
  });
  for (const [key, snap] of Object.entries(data.d)) {
    if (Array.isArray(snap)) data.d[key] = snap.filter(id => featureMap.has(id)).map(id => featureMap.get(id));
    else for (const key of ['polities', 'regions']) if (Array.isArray(snap[key])) snap[key] = snap[key].map(id => featureMap.get(id));
  }
  const cleaned = { ...data, r: [...ringIds].map(id => data.r[id]), f: features };
  return text.slice(0, start) + JSON.stringify(cleaned) + text.slice(end);
}
for (const name of await readdir(join(source, 'js'))) {
  if (name === 'atlas_track.js') continue;
  const text = (await readFile(join(source, 'js', name), 'utf8')).replaceAll("const baseSiteUrl = 'https://deanchen.me/jiangshan-map/';", "const baseSiteUrl = `${location.origin}${location.pathname}`;");
  await writeFile(join(target, 'js', name), ['atlas_boot.js', 'atlas_snapshots.js'].includes(name) ? sanitize(text) : text);
}
await cp(join(source, 'css'), join(target, 'css'), { recursive: true });
await cp(join(source, 'assets'), join(target, 'assets'), { recursive: true, filter: path => !/[/\\](?:preview_|hero_demo_)/.test(path) });
await copyFile(join(source, 'LICENSE'), join(target, 'LICENSE'));
await copyFile(join(source, 'README_ZH.md'), join(target, 'UPSTREAM_README.md'));
let html = await readFile(join(source, 'index.html'), 'utf8');
html = html.replace(/<link[^>]*(?:fonts\.googleapis|fonts\.gstatic)[^>]*>\s*/g, '')
  .replace(/<script[^>]*(?:events\.vercount|cloudflareinsights|atlas_track)[^>]*><\/script>\s*/g, '')
  .replace('<body>', '<body class="hub-jiangshan">')
  .replace('</head>', '<link rel="stylesheet" href="../hub-theme.css?v=1"><script src="../hub-theme.js?v=1"></script><script src="hub-map.js?v=1" defer></script></head>')
  .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex,follow">');
// Remove upstream structured SEO graph and canonical; the Hub shell is the public entry.
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')
  .replace(/<link rel="(?:canonical|alternate)"[^>]*>/g, '');
await writeFile(join(target, 'index.html'), html);
console.log('Imported local Jiangshan runtime; CHGIS prefectures, aliased geometries, unused rings, analytics and preview screenshots excluded.');
