# AERTEX 仓库中文入门导读

> 本文从历史 PR #309 的初学者指南中提炼，并按当前 `main` 分支重新核对。它是阅读地图，不是对每个函数或生产环境的运行保证。代码、Wrangler 配置及自动化测试始终是行为事实来源。

## 1. 先认识仓库中的几个系统

| 位置 | 主要职责 | 建议先看 |
| --- | --- | --- |
| 根目录 Worker 文件 | 主站、身份认证和各独立服务的 HTTP 入口 | `worker.js`、`auth-entry.js`、`watch-worker.js` |
| `studio/` | 路由、会话、权限、业务 API 和网站 UI | `studio/entry.js`、`studio/session-gate.js` |
| `admin/` | 独立管理员控制台与受限 API | `admin-worker.js` |
| `watch-web/`、`AW-Sync/native/` | ActivityWatch 网页统计与 Windows 原生同步客户端 | `watch-web/app.js`、`AW-Sync/native/src/sync.rs` |
| `cash-web/` | 现金流数据模型和浏览器界面 | `cash-web/model.js` |
| `local-bridge/` | 网页与用户电脑本地能力之间的受限桥梁 | `local-bridge/server.mjs` |
| `scripts/`、`.github/workflows/` | 自动检查、构建与部署 | `scripts/security-architecture-check.mjs`、`.github/workflows/studio-check.yml` |
| `supabase/` | 数据库增量迁移与 Edge Functions | `supabase/migrations/` |

主要域名是 `qsseda.com` 与 `qsseda.studio`。Work、Auth、Intelligence、Cash、Watch 和 Admin 通过独立主机名或 Worker 提供服务；不要将旧的 `.online` 域名重新加入部署清单。具体映射以 `studio/domain-family.js` 和各 `wrangler*.jsonc` 为准。

## 2. 一次主站请求真正经过哪里？

初学者容易误以为 `worker.js` 只会直接转发给 `studio/entry.js`。现在不是如此，必须分清入口层次：

1. `wrangler.jsonc` 把主站 Worker 入口指向 `studio/worker-audit.js`。
2. `studio/worker-audit.js` 包裹实际请求处理，并负责适用的访问审计。
3. `worker.js` 执行边缘保护、主站与独立产品分流，以及多个主站 API 的服务端路由。
4. 不在这一层直接处理的 Studio 页面和 API，再进入 `studio/entry.js`。
5. 需要浏览器会话的页面通过 `studio/session-gate.js` 校验，最终由 UI/API 模块生成响应。

例如排查 `/api/tasks`，先在 `worker.js` 搜索路由字符串，再转到相应 `studio/` handler；排查一个页面，可以从 `studio/entry.js` 找到渲染函数和相关脚本。

Work 使用 `wrangler.work.jsonc` 中相同的审计包装入口，但根据主机名决定不同路由。Auth 则由 `wrangler.auth.jsonc` 进入 `studio/auth-audit-entry.js`，再由 `auth-entry.js` 和 `auth-worker.js` 处理，而不是直接复用主站的登录路由。

## 3. 用一张清单理解认证与安全边界

- **身份认证（Authentication）**：确认请求者是谁；重点看 `auth-entry.js`、`auth-worker.js`、`studio/session-gate.js`。
- **授权（Authorization）**：确认已登录用户能访问什么；重点检查每个 API 的用户 ID 来源、对象归属与 Supabase RLS，而不只看前端是否隐藏按钮。
- **会话 Cookie**：`__Host-` Cookie 按主机隔离；跨子域账号标识不应被当作独立的登录凭证。
- **登录跳转**：修改 OAuth/PKCE/state/redirect 或 handoff 时，先查看 `AUTH_PORTAL.md` 与对应测试。
- **限流（Rate limiting）**：敏感身份认证请求使用来源 IP 的限流桶；限流器不可用时该类操作按当前策略返回 HTTP 503，配额超出返回 HTTP 429。普通 API 的降级策略可能不同。
- **浏览器安全**：`studio/routing.js` 配置主要页面响应头；严格 CSP 需要逐页兼容现有脚本，不能未经测试就在整个站点移除内联脚本支持。

读一段 API 代码时依次确认：HTTP 方法 → 输入校验 → 会话身份 → 用户/对象权限 → 数据访问 → 错误状态 → 输出字段。不要把浏览器传入的 Cookie、用户 ID 或文件路径直接视为可信授权依据。

## 4. Supabase 与 R2：两种不同的数据层

- Supabase 存放结构化业务记录、用户身份及数据库权限规则；相关 SQL 位于 `supabase/migrations/`。
- `supabase_admin_tables.sql` 与 `supabase_audit_tables.sql` 仍属于基础建表 SQL，部分后续迁移依赖其中已有对象。**只运行 migrations 并不能保证从全空数据库复原整站。**
- 生产数据库的现有 SQL migration 是历史账本。不要为了格式或注释重写已应用的 SQL；数据库恢复验证应使用隔离的测试项目，而不是直接清空生产库。
- R2 `STORAGE` 负责对象文件，典型入口包括 `studio/storage-api.js`。要区分文件的物理存储键、用户身份、权限、配额和页面缓存。
- `studio/public-wallpapers.js` 是一个特例：当前只保留 PROLED XDR 的只读下载路由，**没有浏览器上传 API**。下载需要对应 R2 对象已经发布；页面代码存在不等于文件一定存在。

## 5. 学习 AERTEX Watch 的一条数据链

1. `AW-Sync/native/src/activitywatch.rs`：访问本机 ActivityWatch Bucket/Event 接口。
2. `AW-Sync/native/src/sync.rs`：增量同步、重叠时间窗口、上传失败重试与游标维护。
3. `watch-worker.js`：在云端完成设备授权、R2 事件存取及同步 API。
4. `watch-web/app.js`：将原始事件经过 AFK、窗口/网站前台交集与去重后汇总为图表指标。
5. `scripts/watch-cloud-check.mjs`：检验关键统计和安全边界，避免一次 UI 改动改变统计口径。

注意：应用总时长与窗口标题总时长是同一批活跃前台事件的不同分组，不应该直接相加；多设备重叠时间也不能重复计算。更多算法与 ActivityWatch v0.13.2 的对照见 `docs/WATCH_ACTIVITYWATCH_PARITY_AUDIT_CN.md`。

## 6. 阅读前端及调试问题的方法

许多 `studio/ui-*.js` 模块把 HTML、CSS、DOM 事件和 API 调用写在同一个 JavaScript 文件里。推荐用“症状 → 页面文字/元素 ID → 事件回调 → API 路径 → 服务端 handler → 数据层”的顺序追踪。

例：一个按钮点击后没有反应，先确认它是否由页面构造函数输出、是否绑定事件、请求是否成功，再判断是浏览器状态、会话还是数据权限问题。不要第一步就修改全局安全中间件。

阅读统计模型时，先找输入与状态变换，再看去重规则、时区/日期边界，最后看展示层的小数舍入。特别警惕把“前端显示值”当作原始存储值。

## 7. 安全修改的一般工作流

1. 新建独立分支，先读最新 `main`；过时 PR 不要不经检查直接合并。
2. 写清改动要保持的不变量，例如“不改变登录边界”“不扩大 R2 用户可读路径”“不更改 Watch 统计口径”。
3. 仅修改本功能涉及的文件，并补充真实行为检查。对纯文档变更可以检查链接和文件存在性，不应为了注释覆盖率重写全仓库。
4. 执行相应 `scripts/*-check.mjs`，再检查 GitHub Actions 的 Studio/Auth/部署结果。
5. 只有 CI 通过才合并；合并后还要核实生产部署结果。自动测试通过不代表所有真实会话都已做端到端验证。

**特别提醒：** 历史 PR #309 的 `scripts/beginner-comments-check.mjs` 会强制几乎所有源码包含指定中文标记。此版本的导读不会迁移该硬性要求：它只检查标记存在，不等于有高质量解释，还会为生成、迁移和第三方代码引入不必要的维护成本。

## 8. 推荐第一次阅读的 12 个文件

1. `studio/domain-family.js` — 产品与主机名之间的关系。
2. `wrangler.jsonc` — Worker 绑定、存储和限流配置。
3. `studio/worker-audit.js` — HTTP 包装入口和访问审计。
4. `worker.js` — 主站路由和 API 分流。
5. `studio/entry.js` — Studio 页面与共享功能路由。
6. `studio/session-gate.js` — Cookie/登录会话边界。
7. `auth-entry.js` — 独立身份服务的路由与限流。
8. `studio/storage-api.js` — 文件对象归属与上传/读取控制。
9. `watch-worker.js` — Watch 服务端同步与查询。
10. `watch-web/app.js` — 活跃时间的计算与前端展示。
11. `cash-web/model.js` — 浏览器端现金流模型。
12. `.github/workflows/studio-check.yml` — 自动检查如何保护业务行为。

## 9. 继续深入的资料

- [仓库主 README](../ReadMe.md)：系统组成及日常维护约定。
- [Studio 模块索引](../studio/README.md)：Studio 目录职责边界。
- [认证门户](../AUTH_PORTAL.md)：登录、会话和 OAuth/PKCE 约定。
- [Watch 算法审计](WATCH_ACTIVITYWATCH_PARITY_AUDIT_CN.md)：ActivityWatch 原版与 AERTEX 衍生指标的区别。
- [Worker 模块化记录](STUDIO_WORKER_MODULARIZATION.md)：为什么拆分、哪些历史约束必须保留。

本文只迁移阅读路径与安全边界知识，不迁移旧分支的运行时代码、旧 SQL 注释或大规模注释覆盖率规则。
