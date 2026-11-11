import { cp, mkdir, readdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const root = resolve(import.meta.dirname, '..');
// Each build uses a new directory; previous packages remain available for rollback.
const release = new Date().toISOString().replaceAll(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const output = join(root, '.build', release);
await mkdir(output, { recursive: true });
for (const entry of await readdir(join(root,'web'), {withFileTypes:true})) {
  if (entry.name.startsWith('.') || ['tools','serve.mjs','README.md','MODULES.md','llm-config.json','llm-config.json.template'].includes(entry.name) || /(?:\.test\.|^smoke)/.test(entry.name)) continue;
  await cp(join(root,'web',entry.name), join(output,entry.name), {recursive:true});
}
await cp(join(root,'data'),join(output,'data'),{recursive:true});
const indexPath = join(output, 'index.html');
await writeFile(indexPath, (await readFile(indexPath,'utf8')).replace('<body>', '<body class="hub-production">'));
for (const name of ['LICENSE','LICENSE.upstream-atlas','THIRD_PARTY_NOTICES.md','UPSTREAM.json']) await copyFile(join(root,name),join(output,name));
await writeFile(join(output,'robots.txt'),'User-agent: *\nAllow: /\nDisallow: /jiangshan/\nSitemap: https://history.blessingshs.cc.cd/sitemap.xml\n');
await writeFile(join(output,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://history.blessingshs.cc.cd/</loc><lastmod>2026-11-11</lastmod></url></urlset>');
// Verify the deploy bundle cannot contain the CHGIS layer or its reference keys.
for(const name of ['atlas_boot.js','atlas_snapshots.js']) {
  const window={}; vm.runInNewContext(readFileSync(join(output,'jiangshan/js',name),'utf8'),{window});
  for(const snap of Object.values(window.ATLAS_SNAPSHOTS)) if(snap.prefectures?.length || snap.prefRef) throw new Error('Restricted CHGIS data present');
}
await mkdir(join(output,'downloads'),{recursive:true});
const sourceFiles = ['web','data','scripts','deploy','package.json','README.md','README.upstream-atlas.md','DEPLOYMENT.md','LICENSE','LICENSE.upstream-atlas','THIRD_PARTY_NOTICES.md','UPSTREAM.json'];
execFileSync('tar',['-czf',join(output,'downloads/history-source.tar.gz'),'--exclude=web/llm-config.json','--exclude=web/.tools','--exclude=web/.npm-cache','--exclude=web/.chrome-profile','--exclude=scripts/server-session.py','-C',root,...sourceFiles],{stdio:'inherit'});
const archive=join(root,'.build',`history-${release}.tar.gz`);
execFileSync('tar',['-czf',archive,'-C',output,'.'],{stdio:'inherit'});
console.log(JSON.stringify({release,output,archive}));
