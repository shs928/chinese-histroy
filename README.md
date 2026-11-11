# 中华历史 · Blessing Hub

在山河之间，读懂中华千年。一个融合中国历史图谱与江山时序地图的历史文化探索站，采用与 Blessing Hub 一致的界面，支持桌面、手机和深浅主题。

**在线访问：[history.blessingshs.cc.cd](https://history.blessingshs.cc.cd/)**

[直接打开历史地图](https://history.blessingshs.cc.cd/?module=atlas&year=-222) · [返回 Hub 主站](https://blessingshs.cc.cd/) · [GitHub 仓库](https://github.com/shs928/chinese-histroy)

## 可以探索什么

- 江山时序：拖动年份浏览历代疆域，查询古今地名，追随历史人物行迹。
- 帝王谱系：七朝 77 位帝王的世系、生平、事件与悬案；可跳转到对应年代的地图。
- 思想源流、诗词鉴赏、格物致知、神话异志：阅读经典与白话、诗人生平、古代工艺和神话图鉴。
- 探索首页：从一个板块、年代或人物开始；顶部始终提供「返回 Hub 主站」，左侧「点赞支持」链接到本仓库。

## 本地运行

需要 Node.js 24，无需安装前端依赖。

```bash
git clone https://github.com/shs928/chinese-histroy.git
cd chinese-histroy
node web/serve.mjs 5186
```

打开 [http://127.0.0.1:5186/web/](http://127.0.0.1:5186/web/)。请使用本地服务器，直接打开 HTML 文件无法加载 JSON 数据。

## 构建与维护

```bash
node scripts/build.mjs
```

静态站和部署压缩包输出到 `.build/`。线上由独立 Nginx 站点提供服务，部署流程、版本切换与 Cloudflare 配置见 [DEPLOYMENT.md](DEPLOYMENT.md)。

| 位置 | 用途 |
| --- | --- |
| `web/index.html`、`web/hub-shell.js` | 站点外壳、导航、返回主站与支持入口 |
| `web/hub-theme.css` | Hub 主题与响应式布局 |
| `web/modules.json` | 板块入口 |
| `web/jiangshan/` | 本地交互地图运行时 |
| `web/jiangshan/source/index.json` | 可编辑地图快照的索引 |
| `data/` | 历史文化知识与插图 |

地图坐标按快照保存，可运行 `node scripts/rebuild-map.mjs` 重新生成地图 JS。上游导入、来源版本和许可说明见 [UPSTREAM.json](UPSTREAM.json) 与 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

本次线上部署为静态站，未接入原项目的本地 AI 代理；阅读、地图、图谱与本地练习可直接使用。

## 开源致谢与许可

- [zinging/chinese-history-atlas](https://github.com/zinging/chinese-history-atlas)：原五个知识板块，保留 [MIT 许可](LICENSE.upstream-atlas) 和[原项目文档](README.upstream-atlas.md)。
- [DeanChensj/jiangshan-map](https://github.com/DeanChensj/jiangshan-map)：交互地图、疆域、地名与人物路线，采用 GPL-3.0。

整合版按 [GPL-3.0](LICENSE) 发布，原有 MIT 材料的授权保持有效。受上游原始条款限制的 CHGIS / Hartwell 郡州府细边界未纳入发布版。历史地图为示意性近似，非精确测绘边界。

线上每个部署版本均提供[对应源码下载](https://history.blessingshs.cc.cd/downloads/history-source.tar.gz)。
