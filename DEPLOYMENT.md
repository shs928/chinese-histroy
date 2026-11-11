# 中华历史 · Blessing Hub 整合版

正式入口：https://history.blessingshs.cc.cd/

## 本地

Node.js 24：`node web/serve.mjs 5186`，打开 http://127.0.0.1:5186/web/ 。

原历史图谱的五个知识板块保留，新增探索首页和本地江山时序地图。首页入口由 web/modules.json 管理。Hub 主题在 web/hub-theme.css；跨板块导航位于 web/hub-shell.js。

## 更新地图

将江山时序上游源码放在相邻 jiangshan-map 目录，运行 `node scripts/vendor-jiangshan.mjs`。该脚本会剔除禁止再分发的 CHGIS 郡州府边界以及别名几何，保留一级政区、历史疆域和人物路线；它也会排除统计脚本及上游截图。保留 web/jiangshan/hub-map.js。运行 `node scripts/map-preview.mjs` 更新可复用疆域生成的首页示意图。

## 构建和部署

运行 `node scripts/build.mjs`。输出为 .build/版本目录 和独立 tar.gz；同时生成对应版本的 GPL 源码下载。

上传静态包到服务器 /var/www/blessing-history/releases/版本目录，Nginx 候选配置来自 deploy/nginx.conf。通过 deploy/activate.sh 版本号 切换 current 软链接；脚本会备份本项目配置、验证 Nginx、重载，并检查历史站、Hub 和 API。现有 API、酒馆与游戏工具保持独立虚拟主机。

Cloudflare：A history 指向 119.45.123.248，开启代理；回源规则 `(http.host eq "history.blessingshs.cc.cd" and ssl)` 将端口设置为 8443，沿用现有 Full 模式。

Hub 项目入口配置位于相邻 hub/src/content.json；历史站独立部署成功后再发布该入口。

## 许可

整合发布 GPL-3.0；原中华历史图谱 MIT 许可保留于 LICENSE.upstream-atlas；详细来源见 THIRD_PARTY_NOTICES.md。每个部署版本提供 /downloads/history-source.tar.gz。上游版本固定于 UPSTREAM.json。

地图的可编辑坐标由 web/jiangshan/source/index.json 索引，按快照保存在 source/snapshots/，避免单个文件过大。运行 `node scripts/rebuild-map.mjs` 可以不依赖另一个上游仓库重建功能相同的地图 JS 包；可选参数为输出目录。上游压缩格式则由 vendor-jiangshan.mjs 保留。重新导入上游后运行 `node scripts/export-map-source.mjs` 同步可读坐标。

## 原有 AI 功能

本部署为静态站，没有发布上游本地 API 代理。网页阅读、地图、图谱和本地练习可用；AI 配置入口在生产版隐藏。需要 AI 点评时，可本地启动上游 Node 服务并配置自己的接口。
