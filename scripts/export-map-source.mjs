// SPDX-License-Identifier: GPL-3.0-only
// Preserve editable, decoded map coordinates alongside the compact runtime.
import {readFile, writeFile, mkdir, unlink} from 'node:fs/promises';
import vm from 'node:vm';
const base=new URL('../web/jiangshan/',import.meta.url);
const boot={}; vm.runInNewContext(await readFile(new URL('js/atlas_boot.js',base),'utf8'),{window:boot});
const full={}; vm.runInNewContext(await readFile(new URL('js/atlas_snapshots.js',base),'utf8'),{window:full});
await mkdir(new URL('source/snapshots/',base),{recursive:true});
const snapshots = [];
for (const [key, snapshot] of Object.entries(full.ATLAS_SNAPSHOTS)) {
  if (!/^[a-z0-9_]+$/i.test(key)) throw new Error('Unexpected map snapshot key');
  const file = `snapshots/${key}.json`;
  await writeFile(new URL(`source/${file}`,base), JSON.stringify(snapshot,null,2)+'\n');
  snapshots.push({key,file});
}
await writeFile(new URL('source/index.json',base),JSON.stringify({license:'GPL-3.0; Jiangshan Atlas, CHGIS layer excluded',bootKeys:Object.keys(boot.ATLAS_SNAPSHOTS),snapshots},null,2)+'\n');
// The former monolithic file is generated data, replaced by the complete index above.
await unlink(new URL('source/snapshots.json',base)).catch(error => { if (error.code !== 'ENOENT') throw error; });
console.log(`Exported ${snapshots.length} editable map snapshots without CHGIS data.`);
