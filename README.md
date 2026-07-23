# 北疆秋日环线 · 十一天自驾助手

面向 2026 年 9 月 29 日至 10 月 9 日北疆自驾行程的手机 Web App。应用包含 11 天每日详情、21 个景点、住宿订单、精确高德地点跳转、全景路线、行前清单和双家庭固定 50/50 记账。

## 本地启动

```bash
npm install
npm run dev -- --port 43127
```

打开 `http://localhost:43127`。界面以 390×844 手机视口为主要设计基准，内容最大宽度为 520px。

生产检查与启动：

```bash
npm run typecheck
npm test
npm run build
npm start -- --port 43127
```

生成静态前端产物（Netlify Functions 独立部署）：

```bash
npm run build:static
```

产物位于 `out/`。未配置高德 Key 时地图页自动使用地点清单，不影响其他页面和精确地点跳转。

## Netlify 部署

仓库连接 Netlify 后使用以下设置自动构建：

- Build command：`npm run build:static`
- Publish directory：`out`
- Functions directory：`netlify/functions`

`netlify.toml` 已设置 `NETLIFY_NEXT_PLUGIN_SKIP=true`，让 Netlify 按纯静态导出部署，而不是启用 Next.js SSR Runtime。Netlify Functions 提供：

- `/api/amap/_AMapService/*`：高德同源安全代理；
- `/api/trip-data/*`：共享清单、消费记录和消费凭证接口；
- Netlify Blobs：站点级持久化存储，重新构建或回滚前端不会清空数据。

在 Netlify 项目环境变量中配置 `NEXT_PUBLIC_AMAP_KEY` 和 `AMAP_SECURITY_JSCODE`；不要提交真实值。推送到 `main` 后 Netlify 会自动构建并发布。

部署到 EdgeOne Makers 时，静态构建脚本会把 `edge-functions/api/amap` 一并复制到 `out/`。在 Makers 项目中把 `AMAP_SECURITY_JSCODE` 配置为服务端环境变量，再以 `NEXT_PUBLIC_AMAP_SERVICE_HOST=/api/amap` 构建，即可使用同源安全代理加载高德地图；安全密钥不得进入静态文件。

## 环境变量

复制 `.env.example` 为未提交的 `.env.local`，按需填写：

```dotenv
NEXT_PUBLIC_AMAP_KEY=
AMAP_SECURITY_JSCODE=
NEXT_PUBLIC_AMAP_SERVICE_HOST=
NEXT_PUBLIC_CLOUDBASE_API_URL=
NEXT_PUBLIC_SITE_URL=
```

- `NEXT_PUBLIC_AMAP_KEY`：高德 JS API 2.0 Web Key。未配置时地图页自动显示可查看的当天地点清单。
- `AMAP_SECURITY_JSCODE`：仅服务端读取的高德安全密钥。应用通过同源 `/_AMapService` 代理转发安全服务请求；不要使用 `NEXT_PUBLIC_` 前缀。
- `NEXT_PUBLIC_AMAP_SERVICE_HOST`：可选的公网高德安全代理前缀；Netlify 和 EdgeOne 使用 `/api/amap`，组件会自动补上高德规定的 `/_AMapService` 固定路径。本地留空即可。
- `NEXT_PUBLIC_TRIP_API_URL`：共享存储接口根地址。Netlify 已在 `netlify.toml` 中设为 `/api/trip-data`；本地留空时使用本机存储。
- `NEXT_PUBLIC_CLOUDBASE_API_URL`：兼容未来腾讯云后端的旧配置；设置 `NEXT_PUBLIC_TRIP_API_URL` 时优先使用前者。
- `NEXT_PUBLIC_SITE_URL`：部署后的公开站点根地址，用于生成分享卡片的绝对链接；本地可留空。

`.env.local` 已由 `.gitignore` 排除。不要把真实 Key、安全密钥写入源代码、README、迁移说明或 Git。

## 当前数据模式

线上 Netlify 版本使用共享模式：

- 清单条目逐项存入 Netlify Blobs，四台手机看到同一完成状态；不同条目的同时修改不会互相覆盖。
- 每笔消费独立存储；最多三张凭证图先在手机端压缩，再作为独立 Blob 上传。
- 清单与当前打开的账本每 15 秒同步一次，重新进入页面、切回浏览器时也会立即刷新。
- 每台手机会缓存最近一次成功读取的数据，临时弱网时仍可查看；写入失败会明确提示，不会伪装成已成功共享。
- 身份和所选日期只保存在本机，四个人不需要注册账号。
- 初始账本包含迁移说明中的两笔演示消费，共 ¥5,760.19；最简平账为家庭 A 向家庭 B 转账 ¥319.91。

本地直接运行 `npm run dev` 时不连接 Netlify，清单和消费保存在 `localStorage`。如需连同 Functions 本地联调，可使用已登录并已关联项目的 Netlify CLI 运行 `netlify dev`。

## 高德地点与地图

所有地点按钮都使用 `uri.amap.com/marker` 并传入已核对的高德坐标和地点名，只在高德中展示标注点，不预设驾车、步行、骑行或自动导航。URI 使用 `callnative=1` 尝试打开高德 App，并可回落到高德 Web 地图；当天入口打开当天终点，地图信息卡打开当前选中的标记点。阿禾公路、喀拉峻草原这类没有唯一且已确认落点的泛路线不展示单点按钮，避免把用户带到错误或非开放位置。

配置高德环境变量后，地图页显示：

- 松绿色完整 18 站路线；
- 暖橙色当天路线和当天标记；
- 日期切换、标记选择、路线居中与浏览器定位；
- 根据底部信息卡实际高度设置的地图取景避让。

原始迁移图片保留在 `图片素材/`，应用只使用复制到 `public/images/` 的版本。
