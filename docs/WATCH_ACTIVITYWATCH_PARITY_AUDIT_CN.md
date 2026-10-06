# AERTEX Watch 与 ActivityWatch v0.13.2 算法 / UI 对照审计

> 面向初学者：这份文档先解释“原版 ActivityWatch 到底怎么算”，再说明 AERTEX Watch 为什么这样实现、哪些地方是等价复现、哪些地方是 AERTEX 自己的派生指标。

## 本次核验使用的材料

本次逐项检查了用户提供的两份 ZIP：

- `Activity-Watch-complete-ui-custom-20261006-120917.zip`
  - `public/app.js`
  - `public/index.html`
  - `public/styles.css`
- `ActivityWatch-original-v0.13.2-with-change-readme.zip`
  - source map 中还原出的 `src/queries.ts`
  - `src/stores/activity.ts`
  - `src/stores/buckets.ts`
  - `src/visualizations/summary.ts`
  - 原版静态 HTML/CSS/JS 结构

## 原版 ActivityWatch 的桌面活动口径

原版 `fullDesktopQuery` 的关键步骤可以概括为：

1. 找到 `currentwindow` Bucket。
2. 对窗口事件执行 `flood(...)`，用 watcher 的心跳间隔补齐很短的采样缝隙。
3. 找到 `afkstatus` Bucket，并只保留 `status = not-afk`。
4. 如果启用了 AFK 过滤，用 `filter_period_intersect(events, not_afk)` 只保留“人在电脑前”时的前台窗口事件。
5. 在同一批已经过滤过的窗口事件上：
   - `merge_events_by_keys(..., ["app", "title"])` 得到窗口标题时间；
   - 再按 `["app"]` 合并得到应用时间；
   - `sum_durations(events)` 得到总活跃时间。

因此，“应用时间”和“窗口时间”不是两个互相独立的屏幕总时长。它们是**同一批 AFK 过滤后的前台窗口事件，按不同维度聚合后的两种视图**。正常情况下二者的总和都应与窗口活跃总时长一致（允许显示舍入误差）。

## 原版 ActivityWatch 的网站时间口径

原版浏览器统计并不是直接把 browser watcher 的所有事件相加，而是：

1. 找到类型为 `web.tab.current` 的浏览器 Bucket。
2. 根据 Bucket ID 判断 Chrome / Edge / Firefox / Brave / Opera / Arc / Vivaldi / Orion / Yandex。
3. 从窗口事件里筛出对应浏览器进程。
4. 用 `filter_period_intersect(browser_events, browser_window_events)` 只保留浏览器真正位于前台的部分。
5. 再对 URL 事件执行 `split_url_events`，最后按 URL / Domain 合并时长。

AERTEX Watch 的“网站”视图现在按同一原则实现：**网站时间只能来自“浏览器 watcher 事件 ∩ 匹配的前台浏览器窗口”**，所以后台标签页不会被当作网站使用时间。

## AERTEX Watch 当前等价实现

当前网页端已经实现或核验：

- 5 秒 ActivityWatch 心跳 `flood` 行为；
- AFK Bucket 缺失与“存在但全程 AFK”两种状态分开处理；
- 每台电脑只选最新的 `currentwindow` / `afkstatus` Bucket；
- 多设备重叠时间只计一次，行为对应原版 `union_no_overlap`；
- 日统计按本地自然小时拆分；
- 周统计按本地自然日边界拆分，避免夏令时导致固定 24 小时切分错误；
- 活跃总时长使用非重叠时间区间；
- 应用切换只基于最终保留下来的前台片段；
- 应用时间、窗口标题时间、网站时间均可切换查看；
- 网站时间只统计前台浏览器；
- 云端事件查询包含跨越查询边界的事件；
- 同步端 / R2 端对重复 ActivityWatch heartbeat 做去重。

## AERTEX 自己的派生指标

下面两项不是 ActivityWatch v0.13.2 官方指标：

### 专注指数

AERTEX Watch 使用：

- 连续活跃区间中达到 25 分钟的“深度专注”占比；
- 每活跃小时的应用切换次数；

组合成 0–100 的启发式评分。

因此 UI 必须明确它是“AERTEX 推导指标”，不能把它解释为 ActivityWatch 官方评分。

### 最长专注

连续活跃区间之间允许最多 5 分钟间隔，但只累计真正的活跃秒数，不把这 5 分钟间隔本身算进专注时间。

## 本次发现并修复的问题

- 活跃分布图的柱子使用百分比高度，但 Grid 行没有显式占据剩余高度；当子元素改成绝对定位后，行高会塌缩，导致所有柱子贴着底线。现在显式使用 `grid-template-rows: minmax(0, 1fr)`。
- 早期版本把专注 Session 的间隔时间一起算进深度专注，导致“专注占比”可能超过 100%；已改成只累计 active seconds。
- 早期多 Bucket / 多设备情况下会把重叠窗口时间重复相加；已按原版 `union_no_overlap` 思路去重。
- 早期找不到 AFK 活跃片段时会错误回退成“全部窗口都活跃”；现在只有“AFK Bucket 确实缺失”才回退，AFK Bucket 存在但没有 `not-afk` 时返回 0 活跃时间。
- ZIP 里的自定义 UI 有友好应用名映射（例如 `msedge.exe -> Microsoft Edge`），曾在改版时遗漏，现已恢复。
- 旧 Node.js 兼容同步脚本曾直接按 RFC3339 字符串比较“最新时间”；遇到不同时区偏移时文本顺序不等于真实时间顺序。现在两份兼容脚本都统一改为 `Date.parse(...)` 后比较时刻。
- 仓库曾存在两份 `aw-sync.mjs` 漂移：`AW-Sync/native/aw-sync.mjs` 已修复而 `watch-web/aw-sync.mjs` 仍是旧代码。现在公开资产与审计副本保持完全一致，并由回归检查锁定。
- `studio-check.yml` 原先只在 Pull Request 的路径过滤器里包含 Watch 文件，Watch-only 变更合并到 `main` 后不会再次触发 Studio Check。现在 push 路径也补齐了 Watch。

## 与原版相比仍未复制的功能

这些是**已识别、但目前有意没有塞进 AERTEX Watch 首页**的 ActivityWatch 功能：

- Category 分类系统与分类过滤；
- “把可听见的后台浏览器标签算作 active”的可选项；
- Stopwatch 手动记录事件；
- Editor watcher 的文件 / 语言 / 项目统计；
- 原版的自定义 View；
- Search / Report / Graph / Query Explorer 等高级页面；
- 原版 Period Usage 历史热度组件。

这些不是“算法没找到”，而是产品范围尚未启用。以后如果要求更接近 ActivityWatch 原版，可以按上面的优先级逐项迁移。

## UI 对照结果

用户提供的自定义 UI 中值得保留的部分已经被吸收：

- 左侧导航；
- 日 / 周切换与日期选择；
- KPI 卡片；
- 活跃分布；
- 数字节奏；
- 应用排行；
- 最近活动；
- 数据源与连接状态；
- 移动端底部导航；
- 应用友好名称与独立颜色。

有意不再保留的部分：

- Watch 页面自己的浅色 / 深色 / 跟随系统设置；
- 固定橙色主色。

原因是 AERTEX Watch 现在必须统一继承主站的外观模式与 `--aertex-accent` 主色。

## 给初学者的阅读顺序

1. 先看 `AW-Sync/native/src/model.rs`：认识同步器的数据结构和几个核心常量。
2. 看 `AW-Sync/native/src/activitywatch.rs`：理解 localhost 自动发现与 ActivityWatch REST API。
3. 看 `AW-Sync/native/src/sync.rs`：理解断点、2 秒重叠、分批上传以及失败时为什么不推进进度。
4. 看 `watch-worker.js`：理解 Device Token、R2 分片、事件去重和浏览器查询边界。
5. 看 `watch-web/app.js`：理解“原始 Bucket -> AFK/flood -> 有效前台片段 -> 指标 -> UI”的数据流。
6. 看 `studio/watch-subdomain.js` 与 `studio/auth-handoff.js`：理解主站账号怎样安全进入独立 aw.* 产品域。
7. 最后看 `scripts/watch-cloud-check.mjs`：这里把关键算法、安全边界和部署假设写成回归检查。

本轮还给 Watch 相关代码补了面向初学者的中文注释，包括原生客户端、Worker、网页算法、登录 handoff、设置教程、域名族、安装器、Wrangler 与 CI。刻意没有把“名字里含 watch 但实际是 Apple Watch 小屏 Intelligence UI”的代码混进 AERTEX Watch 注释范围。
