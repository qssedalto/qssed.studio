# AERTEX 站内统一登录修复（2026-11-14）

## 根因与风险

之前的 `/continue` 和 Main -> Work/GPT/Cash/Watch 交接，会把同一个 Supabase `refresh_token` 发给多个站点，各站 Host-only Cookie 和 Supabase 浏览器 SDK 都可以各自轮换该凭据。Supabase 的令牌轮换使其余站点保留的旧令牌失效；当再次进入相关站点时，可能要求重新输入密码。单纯把 Cookie 设置更长无法修复。

## 修复

1. `auth.qsseda.com`（或同根域下的 `auth.qsseda.studio`）成为**唯一的长期刷新令牌持有者**。正常 `/continue` 和产品交接只传送经 Supabase 验证的短期 `access_token`；绝不将真正的 Refresh Token 复制到页面表单、其他 Worker 的 Cookie 或各产品的 Supabase 浏览器存储。
2. 目标 Worker 校验 Supabase 用户和 active profile 后，设置只属于该 Host 的安全 access Cookie、域级账号身份标记，并删除遗留的产品 refresh Cookie；引入只标识「Auth 管理的会话」的 Host-only SSO Cookie。旧的 main 直接密码登录仍能通过仅在本地主站持有的旧 refresh token 恢复，但 Auth 交接绝不走本地刷新分支。
3. 所有产品 SDK 禁用本机自动轮换，把历史存储中的复制版 Refresh Token 迁移为无效的占位值（不是可用于刷新或登录的凭据）。`setSession` 仅用于向 SDK 提供已验证的短期 access token。
4. 首先部署 Auth，再发布其他产品。网页入口在本地会话缺失、过期时通过 Auth 顶层 `/continue` 自动恢复；若 Auth 仍有有效的 30 天刷新凭据，则无需再次输入密码。
5. 在主站、Work、Intelligence、Cash、Watch 实现**同站点且严格来源校验的隐藏 iframe 续期**：Auth 的 `/sso/silent` 检查允许的 `parent_origin`、随机 nonce、当前登录及 active profile；响应通过 `postMessage(targetOrigin)` 只交付 access token。配套 CSP 的 `frame-ancestors` 只允许当前的、列入白名单的父站点。产品端核对 `event.origin`、`event.source`、nonce 后先通过同源 `/api/auth/bootstrap` 验证账户标记，再更新本地服务器 Cookie 和可选 SDK。失败不清除草稿、不强制重定向。交互式编辑尽量在当前页面无感续期。
6. 主站退出登录不再拿占位令牌调用 Supabase logout，而是清理本地状态并前往 Auth 的 `/logout` 撤销真正的 Auth 会话，写入域级 `signed-out` 标记。旧产品即使保留未过期 Access Token，也不能跨账号复活。

## 安全特性

- Cookie 仍采用 `__Host-`、`HttpOnly`、`Secure`、`SameSite=Lax`；不设置跨子域共享 Refresh Token Cookie。
- `/sso/silent` 返回 `Cache-Control: no-store`；只接受本根域 `qsseda.com`/`qsseda.studio` 的主站、Work、GPT、Cash、Watch 明确来源，拒绝混合根域、非 HTTPS、附带路径、伪造后缀等。Auth 不允许任意第三方 iframe 接收消息。
- 源站 `/api/auth/bootstrap` 在写入会话 Cookie 前再次验证 Supabase 访问令牌、active 状态、当前账号标记，拒绝 `signed-out` 与跨账号状态，忽略客户端任何 `refresh_token` 字段。
- 站点无法通过静态 `__Secure-qsseda-account-id` 直接获得权限；每次 API 请求均由服务端验证 access JWT 和当前账号标记。现有项目及聊天权限 ACL 不变。
- 无效的 Refresh Token、用户主动退出或账户被禁用后不能绕过真实认证；网络暂时不可用时不会把暂时失败当作登录失效。

## 兼容性与故障恢复

- 新版本切换时，正在运行的旧版标签页可能暂时使用旧逻辑。为减少互相覆盖，请关闭旧版标签页后重新打开；**未保存的 TeX 源码先保留/下载**。不需要清空站点存储、WebAuthn/Passkey 或加密聊天身份。
- `qsseda.com` 与 `qsseda.studio` 是两组不同的顶级站点，会话在各自的 `auth.*` 域内管理。浏览器的同站点 Cookie 原则不允许它们直接共享；跨根域不能无条件承诺首次访问免登录。可考虑以后通过显式一次性授权码或规范化入口收敛。
- 浏览器禁用同站点 iframe、Cloudflare 拦截或 JavaScript 不可用时，下一次顶层页面导航仍会走 Auth SSO；正在编辑时不应自动重载以免丢草稿。
- 一般会话有效期仍依照现有 Supabase Auth 策略（浏览器 refresh Cookie 最长 30 天）。真正的撤销、到期、身份变化依旧需要再次登录，不能为了“记住我”取消认证。
- 这批测试模拟了 Supabase 登录/刷新、浏览器 `postMessage`、Cookie 和 CSP 路由；正式发布后仍建议验证真实浏览器的多标签页、后台休眠、Safari/ITP、双根域、网络断开/恢复，并核对实际 Auth 事件日志。不可声称已证明所有浏览器或多地区零缺陷。

## 回归

- `scripts/sso-single-authority-check.mjs`：Auth 只发 Access、跨域令牌不转发、真正的刷新仅由 Auth 调用、iframe 来源与 nonce 限制、账号切换/登出拒绝、临时故障。
- `scripts/sso-browser-runtime-check.mjs`：模拟 iframe `postMessage` 的来源/nonce 伪造、Cookie bootstrap 在 SDK 前、SDK 占位令牌、失败不授权。
- 既有 `scripts/*-check.mjs`、浏览器检查与 `wrangler ... --dry-run` 必须通过后方可合并上线；GitHub Actions P0/P1 发布门禁继续有效。
