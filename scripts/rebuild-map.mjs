// SPDX-License-Identifier: GPL-3.0-only
// Rebuild functional JS bundles from editable coordinates, without the upstream checkout.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const base=new URL('../web/jiangshan/',import.meta.url);
const {bootKeys,snapshots:entries}=JSON.parse(await readFile(new URL('source/index.json',base),'utf8'));
const snapshots={};
for (const {key,file} of entries) {
  if (!/^[a-z0-9_]+$/i.test(key) || file!==`snapshots/${key}.json`) throw new Error('Unexpected map source path');
  snapshots[key]=JSON.parse(await readFile(new URL(`source/${file}`,base),'utf8'));
}
for(const snapshot of Object.values(snapshots)) if(snapshot.prefectures?.length || snapshot.prefRef) throw new Error('Restricted layer is not permitted');
const boot=Object.fromEntries(bootKeys.filter(k=>k in snapshots).map(k=>[k,snapshots[k]]));
const output=process.argv[2] ? pathToFileURL(resolve(process.argv[2])+'/') : new URL('js/',base);
await mkdir(output,{recursive:true});
await writeFile(new URL('atlas_boot.js',output),'/* GPL-3.0; Jiangshan Atlas + Blessing Hub */\nwindow.ATLAS_SNAPSHOTS=Object.assign(window.ATLAS_SNAPSHOTS||{},'+JSON.stringify(boot)+');\n');
await writeFile(new URL('atlas_snapshots.js',output),'/* GPL-3.0; Jiangshan Atlas + Blessing Hub */\nwindow.ATLAS_SNAPSHOTS='+JSON.stringify(snapshots)+';\nwindow.ATLAS_FULL_SNAPSHOTS_LOADED=true;\n');
console.log('Rebuilt map bundles from the included editable source.');
