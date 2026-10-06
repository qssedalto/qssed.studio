# qssed.studio 初学者代码导读（中文）

这份文档面向第一次接触这个仓库的人。目标不是把每一行代码重新翻译成中文，而是先建立“这段代码为什么存在、请求从哪里进、数据往哪里走、改动时最容易踩什么坑”的整体地图。

> 建议：第一次阅读时不要从最大的文件开始。先按“入口 → 路由 → 功能模块 → 数据层 → UI → 自动检查”的顺序走一遍，再去看具体实现。

## 1. 仓库总体结构

这个仓库同时承载多个 AERTEX 产品与基础设施，因此看起来文件很多，但可以先分成几组：

- 根目录 `worker.js` / `*-worker.js`：Cloudflare Worker 入口。它们负责接收 HTTP 请求、识别域名和路径、做会话/安全检查，再把请求交给真正的功能模块。
- `studio/`：AERTEX 主站和多个产品共享的后端/API/UI 模块，是仓库最大的业务目录。
- `watch-web/`：AERTEX Watch 浏览器端仪表盘。
- `AW-Sync/native/`：Windows 原生 AERTEX Watch Sync 客户端。
- `cash-web/`：AERTEX Cash 前端和本地计算模型。
- `admin/`：管理控制面。
- `local-bridge/`：让网页安全地调用用户电脑本地能力的桥接程序。
- `scripts/`：CI 回归检查。很多“不能被未来改坏”的架构规则都写在这里。
- `supabase/`：数据库迁移和边缘函数。历史 migration 应视为已经执行过的账本，不应为了加注释而随意重写。

## 2. 一次网页请求是怎么走的

可以把 Cloudflare Worker 想成网站门口的“总接待台”：

1. 浏览器请求某个域名，例如 `aw.qsseda.com`。
2. 对应 Worker 入口先检查域名、HTTP 方法、安全策略和登录状态。
3. 路由模块根据路径决定：
   - 返回静态网页；
   - 调用某个 API；
   - 跳转到 AERTEX ID 登录；
   - 或拒绝不允许的请求。
4. API 模块从 R2 / Supabase / Durable Object 等数据源读取或写入数据。
5. 最终统一返回 HTTP Response。

看代码时，如果不知道“某个函数是谁调用的”，先从 Worker 入口搜索路径字符串通常最快。

## 3. 主站与独立产品为什么拆开

AERTEX 现在不是单一网页，而是一组互相协作的产品：

- 主站：`qsseda.com`
- Work：`work.qsseda.com`
- Intelligence：`gpt.qsseda.com`
- Cash：`cash.qsseda.com`
- Watch：`aw.qsseda.com`
- Watch 数据 API：`awd.qsseda.com` / `aw.data.qsseda.com`
- ID / Auth、Admin 等也有独立入口。

拆分的原因包括安全边界、部署独立性、缓存策略和产品路由。但登录态、品牌、外观等公共能力仍通过共享模块统一。

## 4. 最值得先读的 12 个文件

### `worker.js`
主站 Cloudflare Worker 入口。先从这里理解主站请求如何进入模块系统。

### `studio/entry.js`
主站业务路由的重要汇合点。很多页面/API 最终在这里被分派。

### `studio/session-gate.js`
登录态与会话保护。修改这里可能影响所有需要登录的产品。

### `studio/appearance.js`
全站浅色/深色/系统模式与主色运行时。独立产品应读取它，而不是各自再造一套主题设置。

### `auth-worker.js`
AERTEX ID / OAuth / SSO 的关键入口。属于高风险代码，改动前必须先理解认证流程。

### `watch-worker.js`
AERTEX Watch 云端入口，包含设备同步 API、Bucket/Event 兼容读取、页面和安装包分发。

### `watch-web/app.js`
Watch 仪表盘核心。完整数据流是：
`ActivityWatch Bucket → 云端事件 → AFK/窗口过滤 → 聚合算法 → 图表/UI`。

### `AW-Sync/native/src/activitywatch.rs`
Windows 客户端怎样发现并读取本机 ActivityWatch REST API。

### `AW-Sync/native/src/sync.rs`
Windows 客户端怎样做增量同步、分批上传和同步游标保存。

### `cash-web/model.js`
Cash 的主要数据模型与计算规则。

### `local-bridge/server.mjs`
网页和本地电脑能力之间的桥梁。

### `scripts/*-check.mjs`
CI 回归检查。改业务代码之后，优先看对应 check 文件，它往往比 README 更准确地表达“哪些行为必须保持”。

## 5. AERTEX Watch 的算法阅读顺序

Watch 是这个仓库里比较适合学习“数据从采集到统计”的一个完整例子。

### 第一步：本机 ActivityWatch

ActivityWatch 在本机维护多个 Bucket，例如：

- `currentwindow`：当前前台窗口；
- `afkstatus`：用户是否离开；
- `web.tab.current`：浏览器标签页。

### 第二步：Windows Sync

`AW-Sync/native/src/activitywatch.rs` 读取 Bucket 和事件。

`AW-Sync/native/src/sync.rs`：
- 首次同步最近一段时间；
- 后续从上次游标继续；
- 给时间区间保留少量 overlap，避免边界丢事件；
- 分批上传；
- 云端再做事件去重。

### 第三步：云端保存

`watch-worker.js` 的 `/api/sync`：
- 验证设备令牌；
- 校验 Bucket/Event；
- 按用户、Bucket、日期分片写 R2；
- 合并重复 heartbeat；
- 更新 Bucket 索引。

### 第四步：网页统计

`watch-web/app.js` 会尽量复现 ActivityWatch v0.13.2 的关键口径：

- 对心跳做 flood；
- `currentwindow ∩ not-afk` 得到真正活跃的前台窗口；
- 多设备重叠只计一次；
- “应用时间”按 app 聚合；
- “窗口时间”按 app + title 聚合；
- “网站时间”把 `web.tab.current` 与匹配的前台浏览器窗口相交后再按域名聚合。

更详细的算法对照见 `docs/WATCH_ACTIVITYWATCH_PARITY_AUDIT_CN.md`。

## 6. 为什么有些指标不是 ActivityWatch 原版指标

AERTEX Watch 的“专注指数”和“最长专注”等属于产品层派生指标。

尤其是“专注指数”：
- 使用深度专注占比；
- 再结合应用切换频率；
- 最终压到 0–100。

它不是 ActivityWatch 官方评分，所以 UI 和代码注释都必须明确这是 AERTEX 的启发式指标。

## 7. 前端代码怎么读

很多 `studio/ui-*.js` 文件都同时包含：
- HTML 字符串；
- CSS；
- DOM 事件绑定；
- API 请求；
- 状态更新。

初学者建议按下面顺序看：

1. 先搜索页面最明显的文字，找到 render 函数。
2. 再找这个 render 函数读取了哪些 state。
3. 搜 state 是在哪里初始化/更新。
4. 找 API 请求路径，例如 `/api/...`。
5. 再回到后端搜索同一个路径。

这样比从文件第一行一路读到最后更快建立因果关系。

## 8. 后端/API 代码怎么读

看到一个 API handler 时，按这个顺序检查：

1. 谁能调用？是否经过 session / token 检查？
2. 输入如何解析？
3. 是否限制长度、数量、日期范围？
4. 数据从哪里读取？
5. 写操作有没有幂等/去重/事务保护？
6. 错误状态码是否区分 400 / 401 / 403 / 404 / 409 / 429 / 5xx？
7. 响应里有没有意外泄露内部信息？

## 9. 认证和安全代码的修改原则

`auth-*`、`session-gate`、`browser-security`、`edge-protection` 属于高风险区域。

初学者不要为了“代码更短”随便：
- 去掉来源校验；
- 放宽 redirect URL；
- 取消 CSRF / PKCE / state 校验；
- 把服务端密钥发给浏览器；
- 把 HttpOnly Cookie 改成 JS 可读；
- 将私有数据接口改成跨域公开。

如果确实需要修改，应同时更新对应 `scripts/*check.mjs`，让 CI 把安全假设固定下来。

## 10. 数据库 migration 为什么没有大规模补注释

`supabase/migrations/` 是历史迁移账本。已经执行过的 migration 最重要的特性是“不变”。

因此本轮中文注释不会为了教学目的批量改写历史 migration。学习数据库结构时：
- 先看最新 schema / docs；
- 再按时间顺序阅读 migration；
- 只对未来新 migration 使用充分中文说明。

这是有意的安全边界，不是遗漏。

## 11. CI check 为什么很重要

这个仓库大量使用“架构字符串 + 行为测试”固定产品边界。例如 Watch check 会检查：
- UI / Data 域名是否拆分；
- Token 是否哈希存储；
- ActivityWatch Bucket/Event API 是否存在；
- 多设备是否去重；
- AFK 是否正确；
- 网站时间是否必须与前台浏览器相交；
- 安装程序是否仍为正式 installer，而不是 portable EXE。

所以新增重要算法时，应同步新增回归测试，而不是只改页面看到“好像正常”。

## 12. 本轮中文注释策略

为了兼顾“对初学者友好”和“不要让业务文件被注释淹没”，本轮采用两层注释：

- 大多数运行时/CI 源文件：增加模块级“初学者导读”，说明它负责什么、从哪里被调用、改动时注意什么。
- 最关键的数据流/认证/Watch 文件：额外增加函数附近的解释性注释，说明算法或安全意图。

有意不批量修改：
- 历史 Supabase migrations；
- `Cargo.lock` 等机器生成/锁文件；
- 纯静态数据表和大量翻译表；
- 图片/二进制资产。

“没有给这些文件加中文注释”是为了保持历史/生成文件稳定，而不是因为它们不重要。
