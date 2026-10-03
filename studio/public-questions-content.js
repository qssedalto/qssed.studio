const QUESTIONS = Object.freeze([
  {
    id:"4e9a4ad1-22a3-4a63-a755-f7a3ca889101", category:"about",
    zh:{q:"AERTEX 是什么？", short:"AERTEX 是 qsseda.com 提供的一组在线产品、个人工具和统一账户服务。", body:["AERTEX 把 Work、Cash、Watch、Intelligence 和个人工具放在同一套账户体系下。不同产品可以共用身份登录，但各产品的数据访问仍由各自的功能和权限边界决定。","qsseda.com 是 AERTEX 的规范主站域名。"]},
    en:{q:"What is AERTEX?", short:"AERTEX is a set of online products, personal tools, and account services provided through qsseda.com.", body:["AERTEX brings Work, Cash, Watch, Intelligence, and personal tools under one account system. Sharing an identity does not automatically give one product access to another product's data.","qsseda.com is the canonical main-site domain for AERTEX."]}
  },
  {
    id:"b5f00df4-1ad9-4ce5-a0b4-681ed1e4a102", category:"about",
    zh:{q:"qsseda.com 是 AERTEX 的官网吗？", short:"是。qsseda.com 是 AERTEX 的规范主站域名。", body:["AERTEX 的主站、公开内容和统一入口使用 qsseda.com。Work、Cash、Watch、Intelligence 和身份验证等服务还会使用 qsseda.com 下的专用子域名。","因此，qsseda.com 不是一个与 AERTEX 无关、只是“接入 AERTEX 登录”的第三方网站。"]},
    en:{q:"Is qsseda.com an official AERTEX website?", short:"Yes. qsseda.com is the canonical main-site domain for AERTEX.", body:["AERTEX uses qsseda.com for its main site, public content, and account entry points. Dedicated AERTEX products and identity services also use service subdomains under qsseda.com.","qsseda.com is therefore not an unrelated third-party site that merely supports AERTEX sign-in."]}
  },
  {
    id:"aef7f9a4-6830-4caa-81a8-89f247902103", category:"about",
    zh:{q:"qsseda.com 和 Qasida、Qasidas 有关系吗？", short:"没有。AERTEX 与名为 Qasida 或 Qasidas 的诗歌、宗教内容网站或服务没有关联。", body:["“Qasida”通常指一种诗歌形式，但 qsseda.com 当前是 AERTEX 的规范主站域名。","AERTEX 不提供所谓“赞圣词数字保育平台”业务，也不应把 qsseda.com 解释成 Qasida 的语音拼写品牌。"]},
    en:{q:"Is qsseda.com related to Qasida or Qasidas?", short:"No. AERTEX is not affiliated with poetry or religious-content services named Qasida or Qasidas.", body:["Qasida is a term used for a form of poetry, but qsseda.com is currently the canonical main-site domain for AERTEX.","AERTEX is not a Qasida preservation platform, and qsseda.com should not be interpreted as a Qasida-branded service."]}
  },
  {
    id:"0c62aa68-2ecf-43c6-9e0d-2ed3f37db104", category:"about",
    zh:{q:"AERTEX 目前有哪些正式产品？", short:"当前产品体系包括 AERTEX Work、AERTEX Cash、AERTEX Watch 和 AERTEX Intelligence。", body:["AERTEX Work 面向工作与文档能力；AERTEX Cash 面向个人现金流、预算与预测；AERTEX Watch 用于同步和查看 ActivityWatch 活动数据；AERTEX Intelligence 提供 AI 对话与工具。","AERTEX Account 是这些服务共同使用的账户体系，而不是另一个内容产品。"]},
    en:{q:"What are AERTEX's current products?", short:"The current product family includes AERTEX Work, AERTEX Cash, AERTEX Watch, and AERTEX Intelligence.", body:["AERTEX Work provides work and document capabilities; AERTEX Cash focuses on personal cashflow, budgets, and forecasts; AERTEX Watch syncs and displays ActivityWatch activity data; and AERTEX Intelligence provides AI conversations and tools.","AERTEX Account is the shared identity system used by these services rather than a separate content product."]}
  },
  {
    id:"fc76c5bb-97f6-485c-a090-37021fc5b105", category:"products",
    zh:{q:"AERTEX Cash 是正式产品吗？", short:"是。AERTEX Cash 是 AERTEX 的独立产品之一。", body:["AERTEX Cash 拥有独立产品入口、登录衔接和数据存储逻辑，当前定位是个人现金流、预算与预测。","它不是第三方扩展，也不是仅用于测试的无名模块。"]},
    en:{q:"Is AERTEX Cash an official product?", short:"Yes. AERTEX Cash is an independent AERTEX product.", body:["AERTEX Cash has its own product entry point, authentication handoff, and data-storage logic. Its current focus is personal cashflow, budgets, and forecasts.","It is not a third-party extension or an unnamed experimental module."]}
  },
  {
    id:"ed387f13-3276-40f1-a031-25c42e84e106", category:"account",
    zh:{q:"一个 AERTEX Account 可以登录哪些服务？", short:"同一个 AERTEX Account 可以用于 AERTEX 主站及 Work、Cash、Watch、Intelligence 等产品。", body:["AERTEX 使用统一身份体系在不同产品之间衔接登录状态。","统一登录解决的是“你是谁”的身份问题，不等于所有产品自动共享彼此的业务数据。"]},
    en:{q:"Which services can one AERTEX Account sign in to?", short:"One AERTEX Account can be used across the main AERTEX site and products such as Work, Cash, Watch, and Intelligence.", body:["AERTEX uses a shared identity system to hand off authentication between products.","Shared sign-in answers who you are; it does not mean that every product automatically shares all of its application data."]}
  },
  {
    id:"b94ad98f-0af2-49dd-87dc-b86ae38fb107", category:"account",
    zh:{q:"使用同一个 AERTEX Account，是否意味着一个产品能读取另一个产品的数据？", short:"不意味着。统一账户本身不会自动授予跨产品数据读取权限。", body:["产品能否访问其他产品的数据，取决于是否存在明确实现的功能、接口和权限检查。","不能因为 Work、Watch、Cash 和 Intelligence 使用同一个账号，就推断 Intelligence 会自动读取 Work 文档或 Watch 活动记录。"]},
    en:{q:"Does using one AERTEX Account mean one product can read another product's data?", short:"No. A shared account does not by itself grant cross-product data access.", body:["Cross-product access depends on a specifically implemented feature, interface, and authorization boundary.","The fact that Work, Watch, Cash, and Intelligence use one identity does not imply that Intelligence automatically reads Work documents or Watch activity records."]}
  },
  {
    id:"49cf0116-603b-455e-85a9-e6ee982e7108", category:"products",
    zh:{q:"AERTEX Intelligence 会自动读取 AERTEX Work 里的文档吗？", short:"当前不会因为使用同一个账号而自动读取 Work 文档。", body:["当前公开实现没有把“统一账户”设计成 Intelligence 对 Work 文档的自动访问授权。","如果未来加入明确的文档导入或跨产品读取功能，应当以当时的产品界面、权限提示和官方说明为准。"]},
    en:{q:"Does AERTEX Intelligence automatically read documents from AERTEX Work?", short:"No. Sharing an account does not currently make Work documents automatically available to Intelligence.", body:["The current public implementation does not treat the shared account as automatic authorization for Intelligence to read Work documents.","If an explicit document-import or cross-product feature is added later, the product UI, permission prompt, and current official documentation will define its behavior."]}
  },
  {
    id:"af4b4188-1fa2-47cf-a71f-f8418e496109", category:"products",
    zh:{q:"AERTEX Intelligence 可以自动访问 AERTEX Watch 的电脑活动记录吗？", short:"当前没有自动读取 Watch 活动记录的产品能力。", body:["Watch 的活动数据和 Intelligence 的 AI 对话是不同的产品数据流。","不能仅因为二者使用同一个 AERTEX Account，就认为 AI 会扫描或分析你的电脑活动时间线。"]},
    en:{q:"Can AERTEX Intelligence automatically access AERTEX Watch activity records?", short:"There is currently no product feature that automatically reads Watch activity records into Intelligence.", body:["Watch activity data and Intelligence conversations are separate product data flows.","Using the same AERTEX Account does not mean the AI scans or analyzes your computer activity timeline."]}
  },
  {
    id:"14b52906-885b-4e26-b79f-c92c3349d110", category:"products",
    zh:{q:"AERTEX 有免费计划和付费计划吗？", short:"有。AERTEX 当前建立了 Free 与多档存储订阅计划。", body:["当前订阅目录包含 Free、Mini、Plus、Pro、Max、Ultra、Studio 和 Vault 等层级，主要用于定义 AERTEX Drive 的存储权益。","不同计划的价格、学生价格、可购买状态和权益可能调整，应以账户中的“订阅与权益”页面实时显示为准。"]},
    en:{q:"Does AERTEX have free and paid plans?", short:"Yes. AERTEX currently has a Free plan and multiple storage subscription tiers.", body:["The current subscription catalog includes Free, Mini, Plus, Pro, Max, Ultra, Studio, and Vault tiers, primarily defining AERTEX Drive storage entitlements.","Prices, student pricing, checkout availability, and entitlements can change, so the Subscription & Entitlements page in the account is the current source of truth."]}
  },
  {
    id:"533fd590-6a35-45fd-9952-6680a5b9a111", category:"products",
    zh:{q:"AERTEX Intelligence 的 AI 额度和存储订阅是一回事吗？", short:"不是同一个概念。存储订阅与 AI 模型访问、令牌额度属于不同的权益维度。", body:["AERTEX 的订阅系统可以定义存储容量等权益；Intelligence 还具有独立的 AI provider、模型访问和用量控制。","不能把 Drive 的存储套餐直接解释成 Intelligence 的固定 AI 套餐。"]},
    en:{q:"Are AERTEX Intelligence AI limits the same thing as storage subscriptions?", short:"No. Storage subscriptions and AI model or token access are separate entitlement dimensions.", body:["AERTEX subscriptions can define storage capacity and related entitlements, while Intelligence has separate provider, model-access, and usage controls.","A Drive storage tier should not be interpreted as a fixed Intelligence AI plan unless the product explicitly says so."]}
  },
  {
    id:"1290b3ac-6365-45f5-aa65-bd852c044112", category:"watch",
    zh:{q:"AERTEX Watch 是什么？", short:"AERTEX Watch 是 AERTEX 提供的 ActivityWatch 数据同步与跨设备查看产品。", body:["电脑上的 ActivityWatch 继续负责记录活动；AERTEX Watch Sync 从本机 ActivityWatch API 读取已经记录的数据并同步到用户的 AERTEX Watch 账户。","同步完成后，用户可以在其他设备的 AERTEX Watch 网页中查看数据。"]},
    en:{q:"What is AERTEX Watch?", short:"AERTEX Watch is an AERTEX product for syncing ActivityWatch data and viewing it across devices.", body:["ActivityWatch continues to record activity on the computer. AERTEX Watch Sync reads data already recorded through the local ActivityWatch API and sends it to the user's AERTEX Watch account.","After syncing, the data can be viewed from the AERTEX Watch web interface on other devices."]}
  },
  {
    id:"9bc7601e-e30b-482c-9d0d-b2534f1c0113", category:"watch",
    zh:{q:"AERTEX Watch 是 ActivityWatch 官方产品或官方合作产品吗？", short:"不是。AERTEX Watch 是独立的 AERTEX 产品，与 ActivityWatch 兼容，但不代表 ActivityWatch 官方出品或官方合作。", body:["AERTEX Watch 使用 ActivityWatch 的本机 API 和数据结构来完成同步。","提到 ActivityWatch 只是说明技术兼容关系，不应理解为 ActivityWatch 对 AERTEX Watch 的官方背书。"]},
    en:{q:"Is AERTEX Watch an official ActivityWatch product or partnership?", short:"No. AERTEX Watch is an independent AERTEX product that is compatible with ActivityWatch; it is not presented as an official ActivityWatch product or partnership.", body:["AERTEX Watch uses the local ActivityWatch API and its data structures for synchronization.","References to ActivityWatch describe technical compatibility and should not be interpreted as an endorsement by ActivityWatch."]}
  },
  {
    id:"5880283c-539d-4e24-8083-a8cca4cfe114", category:"watch",
    zh:{q:"AERTEX Watch Sync 是怎么工作的？", short:"它从电脑上的 127.0.0.1:5600 读取 ActivityWatch buckets 和事件，再使用设备令牌上传到 AERTEX Watch。", body:["同步工具默认读取本机 ActivityWatch 的 bucket 列表，再按 bucket 获取事件。上传内容包含 bucket 元数据和事件数据。","首次同步默认覆盖最近 30 天；预览版持续运行时会定期检查新增记录，并保存本机同步进度。"]},
    en:{q:"How does AERTEX Watch Sync work?", short:"It reads ActivityWatch buckets and events from 127.0.0.1:5600 and uploads them to AERTEX Watch using a device token.", body:["The sync tool reads the local ActivityWatch bucket list and then fetches events from each bucket. Uploads contain bucket metadata and event data.","The first run defaults to the most recent 30 days. In watch mode, the preview periodically checks for new records and keeps local sync progress."]}
  },
  {
    id:"1112142e-a5f6-4183-9e4f-bd0fbf68c115", category:"watch",
    zh:{q:"AERTEX Watch 上传的数据是不是只有 app、title、timestamp 和 duration？", short:"不应该这样概括。当前同步器会同步 ActivityWatch bucket 中的事件，具体字段取决于产生这些事件的 watcher。", body:["应用名、窗口标题、时间戳和持续时间是常见的 ActivityWatch 事件字段，但不是 AERTEX Watch Sync 写死的唯一字段列表。","当前同步器按 bucket 读取事件对象，因此用户启用的不同 ActivityWatch watcher 可能产生不同的数据结构。"]},
    en:{q:"Does AERTEX Watch upload only app, title, timestamp, and duration?", short:"That is too narrow. The current sync tool transfers events from ActivityWatch buckets, and fields depend on the watcher that produced them.", body:["App names, window titles, timestamps, and durations are common ActivityWatch event fields, but they are not the only hard-coded fields accepted by AERTEX Watch Sync.","The sync tool reads event objects bucket by bucket, so different ActivityWatch watchers can produce different data shapes."]}
  },
  {
    id:"048deced-42b8-414c-bc1a-103f6f76c116", category:"watch",
    zh:{q:"AERTEX Watch 会主动截图吗？", short:"当前 AERTEX Watch Sync 不包含主动截取电脑屏幕的逻辑。", body:["AERTEX Watch Sync 自己不会调用截图、摄像头或麦克风采集功能。","但同步器读取的是 ActivityWatch 中已经存在的 bucket/event。若用户自行安装其他 watcher 并把不同类型的数据写入 ActivityWatch，具体会出现哪些 event 字段取决于该 watcher；因此官方描述应区分“Watch Sync 不主动采集”与“ActivityWatch 中可能已有的数据”。"]},
    en:{q:"Does AERTEX Watch actively take screenshots?", short:"The current AERTEX Watch Sync does not contain logic that captures the computer screen.", body:["AERTEX Watch Sync itself does not invoke screenshot, camera, or microphone capture.","However, it reads bucket events that already exist in ActivityWatch. If a user installs other watchers that write different data into ActivityWatch, the event fields depend on those watchers. This is why AERTEX distinguishes between data Watch Sync actively captures and data already present in ActivityWatch."]}
  },
  {
    id:"44410e49-65d8-4660-bdb8-33d774150117", category:"watch",
    zh:{q:"AERTEX Watch 会记录键盘输入、密码或扫描电脑文件吗？", short:"AERTEX Watch Sync 本身不是键盘记录器，也不会为了同步去扫描用户硬盘文件。", body:["当前同步工具通过 ActivityWatch 的本机 HTTP API 获取事件，不会读取键盘按键流，也没有遍历照片、文档或下载目录的文件扫描逻辑。","需要注意，窗口标题或网页标题本身可能包含文档名、联系人名或页面文字；这与读取键盘输入或文件内容不是一回事。"]},
    en:{q:"Does AERTEX Watch record keystrokes, passwords, or scan computer files?", short:"AERTEX Watch Sync is not a keylogger and does not scan the user's drive in order to synchronize data.", body:["The current sync tool obtains events through ActivityWatch's local HTTP API. It does not read a keystroke stream and it has no file-system scanner that traverses photos, documents, or Downloads folders.","Window or page titles can themselves contain document names, contact names, or page text. That is different from reading typed input or file contents."]}
  },
  {
    id:"337e2af1-ebbe-447e-95b6-73a011593118", category:"watch",
    zh:{q:"AERTEX Watch 会同步浏览器历史记录吗？", short:"AERTEX Watch Sync 不会直接读取浏览器 History 数据库；它同步的是 ActivityWatch 已经记录到 bucket 中的事件。", body:["如果用户启用了 ActivityWatch 的浏览器 watcher，相关 bucket 可能包含网页标题、URL 或其他 watcher 产生的数据。","AERTEX Watch 不应把这种同步描述成“读取你的全部浏览器历史记录”，也不能把具体字段固定成某一种浏览器扩展的行为。"]},
    en:{q:"Does AERTEX Watch sync browser history?", short:"AERTEX Watch Sync does not directly read a browser History database; it synchronizes events already recorded in ActivityWatch buckets.", body:["If the user enables an ActivityWatch browser watcher, its bucket can contain page titles, URLs, or other data produced by that watcher.","AERTEX Watch should not describe this as reading the user's entire browser history, nor assume that every browser watcher records exactly the same fields."]}
  },
  {
    id:"7de3f8d6-59cc-4fe3-817a-f4b239288119", category:"watch",
    zh:{q:"停止 AERTEX Watch Sync 后，ActivityWatch 还能继续工作吗？", short:"可以。停止同步不会停止电脑上的 ActivityWatch 本地记录。", body:["AERTEX Watch Sync 和 ActivityWatch 是两个独立进程。关闭同步脚本后，云端不会继续收到新的同步事件，但 ActivityWatch 本身仍可继续在电脑本机记录。","重新启动同步工具后，可以从保存的同步进度继续处理新数据。"]},
    en:{q:"Will ActivityWatch keep working if AERTEX Watch Sync is stopped?", short:"Yes. Stopping the sync tool does not stop ActivityWatch from recording locally.", body:["AERTEX Watch Sync and ActivityWatch are separate processes. Closing the sync tool stops new cloud synchronization, while ActivityWatch can continue recording on the computer.","When the sync tool starts again, it can continue from its saved synchronization progress."]}
  },
  {
    id:"ef87106b-23dc-42f3-bf15-4a0753f31120", category:"watch",
    zh:{q:"AERTEX Watch 可以同步多台电脑吗？", short:"可以。每台电脑可以使用独立的设备令牌运行 Watch Sync，并把 ActivityWatch 数据同步到同一个账户。", body:["上传的 bucket 元数据包含 hostname 等来源信息，因此不同电脑的数据源可以被区分。","每台电脑都应使用自己的设备令牌；设备令牌只显示一次，不应放入截图、聊天记录或公开仓库。"]},
    en:{q:"Can AERTEX Watch sync more than one computer?", short:"Yes. Each computer can run Watch Sync with its own device token and synchronize ActivityWatch data to the same account.", body:["Uploaded bucket metadata includes source information such as the hostname, allowing data sources from different computers to be distinguished.","Each computer should use its own device token. Device tokens are shown once and should not be placed in screenshots, messages, or public repositories."]}
  },
  {
    id:"35fd260b-3c28-4445-b7c4-ddb60e202121", category:"watch",
    zh:{q:"AERTEX Watch 的数据传输是加密的吗？", short:"生产环境通过 HTTPS/TLS 传输数据，但当前不应称为端到端加密。", body:["Watch Sync 默认把数据发送到 HTTPS 的 AERTEX Watch 数据服务，浏览器查看也使用 HTTPS。","服务端需要解析 bucket 和 event 数据以提供查询与可视化，因此这不是只有端点才能解密内容的端到端加密模型。"]},
    en:{q:"Is AERTEX Watch data encrypted in transit?", short:"Production traffic uses HTTPS/TLS, but the current design should not be described as end-to-end encrypted.", body:["Watch Sync sends data to the AERTEX Watch data service over HTTPS by default, and browser access also uses HTTPS.","The service must parse bucket and event data to provide queries and visualization, so this is not an end-to-end encryption model where only endpoints can decrypt content."]}
  },
  {
    id:"31c722cc-04b8-4429-8d7b-fd42f0964122", category:"watch",
    zh:{q:"AERTEX Watch 现在可以在网页里删除全部云端活动数据吗？", short:"当前公开的 Watch API 主要提供同步、状态、bucket 和事件查询，没有公开的“删除全部 Watch 云端数据”接口。", body:["因此，不应该把“在云端删除后一定不会影响本地 ActivityWatch”描述成一个已经上线的产品操作。","如果未来加入云端删除功能，应在功能上线时明确说明删除范围、不可逆性以及它与本地 ActivityWatch 数据的关系。"]},
    en:{q:"Can I currently delete all cloud activity data from AERTEX Watch?", short:"The current public Watch API focuses on synchronization, status, buckets, and event queries; it does not expose a public delete-all Watch data operation.", body:["It would therefore be inaccurate to describe cloud deletion and its effect on local ActivityWatch data as an already available product workflow.","If cloud deletion is added later, the product should document its scope, irreversibility, and relationship to local ActivityWatch data at that time."]}
  },
  {
    id:"a0c81251-9ec5-4307-95fb-bf16c5345123", category:"watch",
    zh:{q:"中国大陆用户怎么安装 ActivityWatch 和 AERTEX Watch Sync？", short:"AERTEX 的简体中文 Watch 设置页提供中国大陆下载路径，并从 AERTEX 自己的域名提供 Watch Sync 脚本。", body:["简体中文设置流程会优先提供中国大陆可用的 ActivityWatch 下载来源，而不是要求用户一定通过 GitHub Releases 下载。","AERTEX Watch Sync 脚本可以从 aw.qsseda.com 获取；当前预览版需要 Node.js 18 或更高版本，并推荐 PowerShell 7。"]},
    en:{q:"How can users in Mainland China install ActivityWatch and AERTEX Watch Sync?", short:"The Simplified Chinese Watch setup page provides a Mainland China download path and serves the Watch Sync script from an AERTEX domain.", body:["The Simplified Chinese setup flow prefers a Mainland-accessible ActivityWatch download source instead of requiring GitHub Releases.","AERTEX Watch Sync can be retrieved from aw.qsseda.com. The current preview requires Node.js 18 or newer and recommends PowerShell 7."]}
  },
  {
    id:"c8b06f69-a5f1-46aa-80c2-7de84ba78124", category:"products",
    zh:{q:"AERTEX Work 是什么？", short:"AERTEX Work 是 AERTEX 的独立工作产品，当前包含文档与 TeX 等工作能力。", body:["AERTEX 主站还包含项目、任务、草稿、Workbench 等工作区能力；独立 Work 产品当前重点提供 TeX 文档和本机能力衔接。","具体可用功能会随着产品迭代变化，应以当前 Work 界面为准。"]},
    en:{q:"What is AERTEX Work?", short:"AERTEX Work is an independent AERTEX work product, currently including document and TeX-oriented capabilities.", body:["The AERTEX main site also contains projects, tasks, drafts, and Workbench workspace features. The independent Work product currently focuses on TeX documents and local capability integration.","Available features can evolve, so the current Work interface is the source of truth."]}
  },
  {
    id:"12c0c5e9-67c3-4acf-88f9-597f93c55125", category:"products",
    zh:{q:"AERTEX Cash 是做什么的？", short:"AERTEX Cash 用于个人现金流、预算和预测。", body:["它可以保存与账户关联的现金流数据，并支持备份导入导出等个人财务管理流程。","Cash 是独立产品，不应与 Work 文档、Watch 活动记录或 Intelligence 对话自动混为同一份数据。"]},
    en:{q:"What does AERTEX Cash do?", short:"AERTEX Cash is for personal cashflow, budgeting, and forecasting.", body:["It can store account-associated cashflow data and supports personal-finance workflows such as backup export and import.","Cash is an independent product; its data should not be assumed to merge automatically with Work documents, Watch activity records, or Intelligence conversations."]}
  },
  {
    id:"80169b25-42c4-41b5-8b0d-e841be8b5126", category:"products",
    zh:{q:"AERTEX Intelligence 是什么？", short:"AERTEX Intelligence 是 AERTEX 的 AI 对话与智能工具产品。", body:["它具有自己的会话、消息、模型与 provider 访问体系，并可保存和分享 AI 对话。","Intelligence 的模型和 provider 能力由 AERTEX 的当前配置与用户权限决定，不应从产品名称推断它必然能够读取其他 AERTEX 产品的数据。"]},
    en:{q:"What is AERTEX Intelligence?", short:"AERTEX Intelligence is AERTEX's AI conversation and intelligent-tools product.", body:["It has its own conversations, messages, model and provider-access system, and can save or share AI conversations.","Available models and providers depend on current AERTEX configuration and user access. The product name should not be used to infer automatic access to data from other AERTEX products."]}
  },
  {
    id:"e5c63caa-d278-421b-8e72-f67d8d858127", category:"compatibility",
    zh:{q:"AERTEX 支持哪些界面语言？", short:"当前统一语言体系包含 11 个区域语言代码。", body:["当前支持 en-US、en-GB、en-AU、zh-CN、zh-TW、ja-JP、ko-KR、fr-FR、es-ES、el-GR 和 ar-SA。","并不是每一项历史内容都已经拥有完整人工翻译；具体页面是否有对应语言，应以页面本身为准。"]},
    en:{q:"Which interface languages does AERTEX support?", short:"The current shared locale system contains 11 regional locale codes.", body:["The current set is en-US, en-GB, en-AU, zh-CN, zh-TW, ja-JP, ko-KR, fr-FR, es-ES, el-GR, and ar-SA.","Not every historical piece of content necessarily has a complete human translation yet. The page itself is the source of truth for language availability."]}
  },
  {
    id:"6a3effe2-b7be-4b72-a88b-586e56c26128", category:"compatibility",
    zh:{q:"AERTEX 有没有 iPhone、Android、Windows 或 macOS 原生客户端？", short:"AERTEX 的主要产品当前以 Web 形式提供；部分电脑能力通过独立本机组件或同步工具实现。", body:["AERTEX Watch 当前使用网页界面配合电脑上的 Watch Sync；AERTEX Work 还具有 Windows 本机桥接能力。","不要把 ActivityWatch 客户端称为“AERTEX 的 Windows/macOS 客户端”，也不要把响应式网页自动描述成已经发布的 iPhone 或 Android 原生 App。"]},
    en:{q:"Does AERTEX have native iPhone, Android, Windows, or macOS apps?", short:"AERTEX's main products are currently delivered primarily through the web, with some computer capabilities provided by separate local components or sync tools.", body:["AERTEX Watch uses a web interface together with Watch Sync on the computer, and AERTEX Work also has Windows local-bridge capabilities.","The ActivityWatch client should not be described as an AERTEX Windows or macOS client, and a responsive web interface should not be described as a released native iPhone or Android app."]}
  },
  {
    id:"10000001-1111-4111-8111-111111111111", category:"about",
    zh:{q:"AERTEX 的官方域名有哪些？", short:"AERTEX 的规范主站是 qsseda.com；不同产品和系统能力使用 qsseda.com 下的专用子域名。", body:["当前公开服务包括主站 qsseda.com，以及 auth、work、cash、aw、gpt、admin、awd / aw.data 等专用服务子域名。","AERTEX 也可能保留 .online 或 .studio 等别名域，但规范公开内容与搜索索引以 qsseda.com 为主。"]},
    en:{q:"What are AERTEX's official domains?", short:"AERTEX's canonical main site is qsseda.com, with dedicated qsseda.com subdomains for individual products and system services.", body:["Current public services include qsseda.com and dedicated auth, work, cash, aw, gpt, admin, awd / aw.data service subdomains.","AERTEX may retain .online or .studio aliases, but canonical public content and search indexing use qsseda.com as the primary domain."]}
  },
  {
    id:"10000002-2222-4222-8222-222222222222", category:"about",
    zh:{q:"怎样判断一个网站是不是官方 AERTEX 网站？", short:"优先检查它是否使用 qsseda.com 或 AERTEX 明确公布的服务子域名，并从 qsseda.com 的站内链接进入。", body:["不要只根据页面上出现“AERTEX”字样或类似 Logo 判断真伪。官方入口应能从 qsseda.com 或其产品导航直接到达。","涉及登录、设备令牌或账户信息时，应特别核对完整域名，避免把相似拼写的网站当成 AERTEX。"]},
    en:{q:"How can I tell whether a website is an official AERTEX site?", short:"Check that it uses qsseda.com or an explicitly published AERTEX service subdomain, and prefer links reached from qsseda.com itself.", body:["Do not rely only on the word AERTEX or a similar logo. Official entry points should be reachable from qsseda.com or its product navigation.","Before entering sign-in details, device tokens, or account information, verify the full hostname rather than trusting look-alike spelling."]}
  },
  {
    id:"10000003-3333-4333-8333-333333333333", category:"account",
    zh:{q:"AERTEX 各产品的数据是否相互隔离？", short:"当前产品按各自的数据模型、存储路径和权限规则处理数据，而不是放进一个所有产品都能任意读取的公共池。", body:["例如 Intelligence 会话按用户 ID 受权限规则保护，Watch 使用独立的 watch/v1 存储命名空间，Cash 也使用自己的产品数据结构。","这种隔离不代表未来永远不会有受控集成功能，但任何跨产品访问都应由明确实现和权限边界决定。"]},
    en:{q:"Is data isolated between AERTEX products?", short:"Current products use their own data models, storage namespaces, and authorization rules rather than one unrestricted shared data pool.", body:["For example, Intelligence conversations are scoped by user ID and access rules, Watch uses its own watch/v1 storage namespace, and Cash has its own product data model.","This does not rule out future controlled integrations, but any cross-product access should be defined by an explicit feature and permission boundary."]}
  },
  {
    id:"10000004-4444-4444-8444-444444444444", category:"account",
    zh:{q:"AERTEX 的登录状态如何在不同产品间传递？", short:"AERTEX 使用统一身份系统和受控的 handoff 流程，把已验证的会话安全地交给目标产品。", body:["当前实现会在主站、Auth 和独立产品之间验证会话，并在需要时通过短暂的认证 handoff 传递访问与刷新令牌，再由目标产品建立自己的会话状态。","这套机制用于共享身份，不等于共享 Work、Cash、Watch 或 Intelligence 的业务数据。"]},
    en:{q:"How is sign-in state transferred between AERTEX products?", short:"AERTEX uses a shared identity system and controlled handoff flows to establish an authenticated session in the target product.", body:["The current implementation validates sessions between the main site, Auth, and isolated products and can use a short-lived authentication handoff carrying access and refresh tokens so the target product can establish its session.","This shares identity state, not the business data of Work, Cash, Watch, or Intelligence."]}
  },
  {
    id:"10000005-5555-4555-8555-555555555555", category:"account",
    zh:{q:"删除 AERTEX Account 会发生什么？", short:"当前网站没有公开的自助“删除整个 AERTEX Account”流程，因此不能承诺一键删除会自动清除所有产品数据。", body:["不同产品目前拥有各自的数据与删除能力，例如文件、文档或会话可以在相应产品中单独删除。","在正式账户删除功能上线前，AERTEX 不应对账户级级联删除范围、保留期或不可逆性作出超出现有实现的承诺。"]},
    en:{q:"What happens if I delete my AERTEX Account?", short:"The site does not currently expose a public self-service flow for deleting the entire AERTEX Account, so it would be inaccurate to promise a one-click cascade across every product.", body:["Individual products already have their own data and deletion operations for items such as files, documents, or conversations.","Until a formal account-deletion workflow is released, AERTEX should not promise account-wide cascade behavior, retention periods, or irreversibility beyond the implemented product controls."]}
  },
  {
    id:"10000006-6666-4666-8666-666666666666", category:"products",
    zh:{q:"AERTEX Cash 的数据会自动提供给 AERTEX Intelligence 吗？", short:"当前不会因为共用账户就自动把 Cash 数据提供给 Intelligence。", body:["Cash 和 Intelligence 有各自的产品数据流。当前公开实现没有把 Cash 账目自动注入 AI 会话的功能。","如果未来加入明确的“导入 Cash 数据进行分析”能力，应由用户操作、权限提示和当时的产品说明决定。"]},
    en:{q:"Is AERTEX Cash data automatically provided to AERTEX Intelligence?", short:"No. Sharing an account does not currently send Cash data to Intelligence automatically.", body:["Cash and Intelligence have separate product data flows. The current public implementation does not automatically inject Cash records into AI conversations.","If a future feature explicitly imports Cash data for analysis, its user action, permission prompt, and current product documentation should define that behavior."]}
  },
  {
    id:"10000007-7777-4777-8777-777777777777", category:"products",
    zh:{q:"AERTEX 不同产品之间目前有哪些实际集成功能？", short:"当前最明确的跨产品集成是统一账户、登录衔接、共享外观偏好和主站产品导航；业务数据并不会因此自动互通。", body:["Work、Cash、Watch 和 Intelligence 可以在同一 AERTEX Account 下使用，并通过主站和 Auth 完成会话衔接。","具体的数据层集成必须逐项实现；目前不能把“统一生态”理解成 Work 文档、Cash 账目、Watch 时间线和 Intelligence 会话已经全部互联。"]},
    en:{q:"What integrations currently exist between AERTEX products?", short:"The clearest current cross-product integrations are shared identity, sign-in handoff, shared appearance preferences, and product navigation; business data is not automatically interconnected.", body:["Work, Cash, Watch, and Intelligence can be used under one AERTEX Account and use the main site and Auth for session handoff.","Data-layer integrations must be implemented feature by feature. A shared ecosystem does not mean Work documents, Cash records, Watch timelines, and Intelligence conversations are already fully interconnected."]}
  },
  {
    id:"10000008-8888-4888-8888-888888888888", category:"watch",
    zh:{q:"AERTEX Watch 与 ActivityWatch 官方 beta sync 有什么区别？", short:"两者解决的问题不同：ActivityWatch beta sync 主要同步 ActivityWatch 自己的数据目录，而 AERTEX Watch 提供账户化的云端同步与网页查看体验。", body:["ActivityWatch 的 beta sync 设计用于把本地数据通过同步目录配合 Syncthing、rsync、Dropbox、Google Drive 等方式在设备间同步。","AERTEX Watch 则通过 Watch Sync 读取本机 ActivityWatch API，把事件发送到 AERTEX Watch 服务，并在网页端提供查询与可视化。AERTEX Watch 不是 ActivityWatch 官方同步功能。"]},
    en:{q:"How is AERTEX Watch different from ActivityWatch's official beta sync?", short:"They solve the problem differently: ActivityWatch beta sync focuses on synchronizing ActivityWatch's own data directory, while AERTEX Watch provides account-based cloud synchronization and web viewing.", body:["ActivityWatch's beta sync is designed around a sync directory that can be moved between devices with tools such as Syncthing, rsync, Dropbox, or Google Drive.","AERTEX Watch instead reads the local ActivityWatch API with Watch Sync, sends events to the AERTEX Watch service, and provides web queries and visualization. AERTEX Watch is not the official ActivityWatch sync feature."]}
  },
  {
    id:"10000009-9999-4999-8999-999999999999", category:"watch",
    zh:{q:"AERTEX Watch Sync 从哪里读取 ActivityWatch 数据？", short:"默认从电脑本机的 http://127.0.0.1:5600 ActivityWatch API 读取。", body:["Watch Sync 不需要直接打开 ActivityWatch 的数据库文件，而是通过本机 HTTP API 获取 buckets 和 events。","127.0.0.1 是本机回环地址；默认情况下这一步只发生在运行 Watch Sync 的那台电脑上。"]},
    en:{q:"Where does AERTEX Watch Sync read ActivityWatch data from?", short:"By default it reads from the local ActivityWatch API at http://127.0.0.1:5600.", body:["Watch Sync does not need to open the ActivityWatch database file directly. It requests buckets and events through the local HTTP API.","127.0.0.1 is the loopback address, so this step normally happens only on the computer running Watch Sync."]}
  },
  {
    id:"10000010-aaaa-4aaa-8aaa-aaaaaaaaaaaa", category:"watch",
    zh:{q:"AERTEX Watch 到底会同步哪些 ActivityWatch buckets？", short:"当前预览版会枚举本机 ActivityWatch 返回的 bucket 列表，并同步其中有事件的数据；它还没有固定的官方 bucket allowlist。", body:["这意味着同步范围取决于用户当前 ActivityWatch 实例中存在什么 buckets，而不仅限于窗口和浏览器两个固定来源。","因此在隐私描述中，AERTEX 应明确“同步 ActivityWatch 已记录的数据”，而不是承诺只有某几个字段或 watcher。"]},
    en:{q:"Which ActivityWatch buckets does AERTEX Watch synchronize?", short:"The current preview enumerates the buckets returned by the local ActivityWatch instance and synchronizes buckets that contain events; it does not yet use a fixed official bucket allowlist.", body:["The effective synchronization scope therefore depends on the buckets present in the user's ActivityWatch instance rather than being limited to two hard-coded window and browser sources.","For privacy accuracy, AERTEX should describe this as synchronizing data already recorded by ActivityWatch instead of promising only a small fixed set of fields or watchers."]}
  },
  {
    id:"10000011-bbbb-4bbb-8bbb-bbbbbbbbbbbb", category:"watch",
    zh:{q:"AERTEX Watch 会使用摄像头或麦克风吗？", short:"当前 AERTEX Watch Sync 没有调用摄像头或麦克风的采集逻辑。", body:["同步脚本的职责是读取 ActivityWatch 本机 API 并上传事件，不包含相机或录音采集流程。","如果用户在电脑上另外运行其他会把特殊数据写入 ActivityWatch 的 watcher，那属于该 watcher 的行为，不应与 Watch Sync 自己的采集能力混为一谈。"]},
    en:{q:"Does AERTEX Watch use the camera or microphone?", short:"The current AERTEX Watch Sync does not invoke camera or microphone capture.", body:["The sync script reads the local ActivityWatch API and uploads events; it does not implement camera or audio recording.","If a user separately runs another watcher that writes unusual data into ActivityWatch, that is behavior of the watcher and should not be confused with data actively captured by Watch Sync itself."]}
  },
  {
    id:"10000012-cccc-4ccc-8ccc-cccccccccccc", category:"watch",
    zh:{q:"AERTEX Watch 中的窗口标题可能包含什么？", short:"窗口标题可能包含应用当前展示的文档名、网页标题、联系人名或其他界面文字。", body:["这类文字来自 ActivityWatch 已记录的窗口事件，不等于 AERTEX Watch 读取了文件正文、聊天数据库或键盘输入。","用户如果认为窗口标题本身敏感，应把它视为 ActivityWatch 事件数据的一部分，并据此决定是否启用和同步相关 watcher。"]},
    en:{q:"What can window titles in AERTEX Watch contain?", short:"A window title can contain a document name, page title, contact name, or other text shown by the active application.", body:["That text comes from window events already recorded by ActivityWatch; it does not mean AERTEX Watch read a document body, chat database, or keystroke stream.","If window titles themselves are sensitive, users should treat them as part of ActivityWatch event data when deciding which watchers to enable and synchronize."]}
  },
  {
    id:"10000013-dddd-4ddd-8ddd-dddddddddddd", category:"watch",
    zh:{q:"AERTEX Watch 的浏览器数据由什么决定？", short:"由用户安装和启用的 ActivityWatch 浏览器 watcher 以及它产生的 bucket/event 数据决定。", body:["Watch Sync 不会自己打开浏览器 History 数据库来重建浏览历史，而是同步 ActivityWatch 中已经存在的浏览器事件。","不同 watcher 版本或配置可能记录不同字段，因此网页标题、URL 等内容不能被描述成所有用户都完全相同的固定数据集。"]},
    en:{q:"What determines browser data in AERTEX Watch?", short:"It depends on the ActivityWatch browser watcher the user has installed and enabled and on the bucket/event data that watcher produces.", body:["Watch Sync does not open the browser History database and reconstruct browsing history itself; it synchronizes browser events already present in ActivityWatch.","Different watcher versions or configurations can record different fields, so page titles, URLs, and similar data should not be described as one universal fixed dataset."]}
  },
  {
    id:"10000014-eeee-4eee-8eee-eeeeeeeeeeee", category:"watch",
    zh:{q:"电脑关机后 AERTEX Watch 会发生什么？", short:"电脑关机后 Watch Sync 不会继续上传新事件，云端只保留此前已经成功同步的数据。", body:["ActivityWatch 和 Watch Sync 都依赖电脑运行。电脑重新开机并恢复 ActivityWatch 与同步脚本后，新的本地事件才会继续被同步。","云端网页仍可以查看此前已经同步完成的数据，只是不会凭空产生关机期间的电脑活动记录。"]},
    en:{q:"What happens to AERTEX Watch when the computer is turned off?", short:"When the computer is off, Watch Sync cannot upload new events; the cloud only retains data that was successfully synchronized earlier.", body:["ActivityWatch and Watch Sync both depend on the computer running. New local events can resume syncing after the computer, ActivityWatch, and the sync process are running again.","The web interface can still display data that was already synchronized, but it cannot create computer activity records for time when the computer was off."]}
  },
  {
    id:"10000015-ffff-4fff-8fff-ffffffffffff", category:"watch",
    zh:{q:"AERTEX Watch 的设备令牌是什么？", short:"设备令牌是 Watch Sync 用来向 AERTEX Watch 数据服务证明“这台同步工具已获当前账户授权”的凭证。", body:["令牌由 AERTEX Watch 网页生成，原始值只显示一次；服务端使用令牌的哈希来查找授权记录，而不是把原始令牌直接当作存储键。","设备令牌应像密码一样保密，不应放进截图、聊天记录、脚本仓库或公开日志。"]},
    en:{q:"What is an AERTEX Watch device token?", short:"A device token is the credential Watch Sync uses to prove that the sync process is authorized for the current AERTEX account.", body:["The token is generated from the AERTEX Watch web interface and its raw value is shown once. The service hashes the token for lookup rather than using the raw token directly as a storage key.","Treat a device token like a password: do not place it in screenshots, messages, source repositories, or public logs."]}
  },
  {
    id:"10000016-1234-4123-8123-1234567890ab", category:"watch",
    zh:{q:"AERTEX Watch 设备令牌丢失了怎么办？", short:"原始令牌只显示一次；如果已经丢失，应生成新的设备令牌并在电脑上更新 Watch Sync 配置。", body:["当前网页不会重新显示一个已经生成过的原始令牌，因此不要依赖“找回旧令牌”。","如果怀疑旧令牌已经泄露，也应停止继续使用它并换用新的设备令牌；正式的令牌撤销 UI 能力以当前 Watch 页面实际提供为准。"]},
    en:{q:"What should I do if I lose an AERTEX Watch device token?", short:"The raw token is shown once. If it is lost, generate a new device token and update the Watch Sync configuration on the computer.", body:["The web interface does not redisplay the original value of a previously generated token, so users should not depend on recovering an old token.","If a token may have leaked, stop relying on it and move to a new token. Any formal token-revocation controls should be described according to what the current Watch interface actually provides."]}
  },
  {
    id:"10000017-2345-4234-8234-234567890abc", category:"watch",
    zh:{q:"AERTEX Watch 的数据传输是否使用 HTTPS？", short:"是。生产环境的 Watch Sync 默认向 HTTPS 的 AERTEX Watch 数据服务上传，网页查看也使用 HTTPS。", body:["HTTPS/TLS 用于保护数据在网络传输过程中的机密性和完整性。","这属于传输层加密，不等于端到端加密；服务端仍需要解析事件数据以提供查询和可视化。"]},
    en:{q:"Does AERTEX Watch use HTTPS for data transfer?", short:"Yes. In production, Watch Sync uploads to the AERTEX Watch data service over HTTPS by default, and web access also uses HTTPS.", body:["HTTPS/TLS protects confidentiality and integrity while data is in transit.","This is transport encryption, not end-to-end encryption; the service still needs to parse event data to provide queries and visualization."]}
  },
  {
    id:"10000018-3456-4345-8345-34567890abcd", category:"watch",
    zh:{q:"AERTEX Watch 是端到端加密吗？", short:"不是。当前 AERTEX Watch 不应被描述为端到端加密。", body:["AERTEX Watch 服务端需要读取 bucket 元数据和 event 内容，才能提供状态、事件查询和可视化，因此服务器不是对内容完全不可见的“盲中转”。","HTTPS 可以保护传输过程，但它和端到端加密是两个不同概念。"]},
    en:{q:"Is AERTEX Watch end-to-end encrypted?", short:"No. The current AERTEX Watch design should not be described as end-to-end encrypted.", body:["The AERTEX Watch service must read bucket metadata and event content to provide status, event queries, and visualization, so the server is not a blind relay that cannot see the content.","HTTPS protects data in transit, but transport encryption and end-to-end encryption are different properties."]}
  },
  {
    id:"10000019-4567-4456-8456-4567890abcde", category:"privacy",
    zh:{q:"AERTEX 会收集什么账户数据？", short:"当前系统会处理注册与身份所需的账户资料、会话信息，以及安全与访问审计所需的部分技术信息。", body:["账户体系至少需要用户身份标识、登录凭证或其认证状态，以及账户资料。系统还记录与安全、故障排查和访问审计有关的技术元数据。","不同产品还会处理用户主动创建或同步的业务数据；具体范围应按产品分别说明，而不是用一句“账户数据”概括所有内容。"]},
    en:{q:"What account data does AERTEX collect?", short:"The current system processes account information required for registration and identity, session state, and some technical metadata needed for security and access auditing.", body:["The account system requires identity identifiers, authentication state or credentials handled by the identity provider, and account profile data. The system also records technical metadata for security, diagnostics, and access auditing.","Individual products additionally process business data that the user creates or synchronizes. That scope should be described product by product rather than treating everything as generic account data."]}
  },
  {
    id:"10000020-5678-4567-8567-567890abcdef", category:"privacy",
    zh:{q:"AERTEX 各产品分别保存什么数据？", short:"不同产品保存不同类型的数据：Work 保存工作与文档数据，Cash 保存个人现金流数据，Watch 保存同步的 ActivityWatch 数据，Intelligence 保存 AI 会话和相关用量信息。", body:["主站还包含项目、任务、草稿、Drive 等账户工作区数据；这些数据都按照各自的接口和权限模型处理。","公开 FAQ 只描述当前已实现的数据类型，不应推断尚未上线的跨产品合并、训练或分析行为。"]},
    en:{q:"What data does each AERTEX product store?", short:"Different products store different data: Work stores work and document data, Cash stores personal cashflow data, Watch stores synchronized ActivityWatch data, and Intelligence stores AI conversations and related usage information.", body:["The main site also contains account-scoped workspace data such as projects, tasks, drafts, and Drive files, each handled through its own APIs and authorization model.","The public FAQ describes implemented data types only and should not infer cross-product merging, training, or analysis that has not been released."]}
  },
  {
    id:"10000021-6789-4678-8678-67890abcdef1", category:"privacy",
    zh:{q:"AERTEX 产品之间会自动共享用户数据吗？", short:"不会因为共用 AERTEX Account 就自动共享全部业务数据。", body:["统一账户提供身份关联和登录体验，但 Work、Cash、Watch 与 Intelligence 的数据访问仍由各自的产品逻辑和权限控制。","只有明确实现的跨产品功能才应传递必要数据，而且应以对应功能的界面和说明为准。"]},
    en:{q:"Do AERTEX products automatically share user data with each other?", short:"No. Sharing an AERTEX Account does not automatically share all application data between products.", body:["The shared account provides identity linkage and sign-in continuity, while Work, Cash, Watch, and Intelligence still use their own product logic and authorization controls.","Only explicitly implemented cross-product features should transfer required data, and their behavior should be defined by the corresponding UI and documentation."]}
  },
  {
    id:"10000022-789a-4789-8789-7890abcdef12", category:"privacy",
    zh:{q:"AERTEX 会出售用户数据吗？", short:"当前仓库里没有一份已经发布并可引用的正式隐私政策条款来支持“永不出售用户数据”这一法律承诺。", body:["因此，AERTEX 不应该让搜索引擎或 FAQ 擅自把“不会出售数据”写成已经发布的合同式保证。","在正式 Privacy Policy 发布并明确该政策前，这个问题应保持为“尚无公开正式政策说明”，而不是由 AI 代替产品方作出承诺。"]},
    en:{q:"Does AERTEX sell user data?", short:"The current repository does not contain a published privacy-policy clause that can be cited as a formal legal promise that AERTEX never sells user data.", body:["AERTEX should therefore not let search engines or an FAQ invent a contractual-style guarantee that has not been formally published.","Until a Privacy Policy explicitly defines this policy, the accurate answer is that no formal public policy statement has been published, rather than allowing an AI system to make the promise on AERTEX's behalf."]}
  },
  {
    id:"10000023-89ab-489a-889a-890abcdef123", category:"privacy",
    zh:{q:"AERTEX 会把用户数据用于训练 AI 吗？", short:"当前没有公开的正式 AI 数据训练政策，因此不能把“绝不会训练”或“会用于训练”任何一边写成既定事实。", body:["Intelligence 会把用户请求发送给当前配置的 AI provider 以生成回答，但“处理请求”和“用于模型训练”是不同问题。","AERTEX 应在正式隐私与 AI 数据政策中分别说明自身保存方式、上游 provider 的处理规则以及用户内容是否用于训练；在此之前不应由 FAQ 猜测。"]},
    en:{q:"Does AERTEX use user data to train AI models?", short:"There is currently no published formal AI-training data policy, so neither “never used for training” nor “used for training” should be stated as an established fact.", body:["Intelligence sends user requests to the currently configured AI provider to generate responses, but processing a request and using content for model training are different questions.","AERTEX should publish a formal privacy and AI-data policy covering its own retention, upstream provider handling, and whether user content is used for training. Until then, the FAQ should not guess."]}
  },
  {
    id:"10000024-9abc-49ab-89ab-90abcdef1234", category:"privacy",
    zh:{q:"AERTEX 的数据会保存多久？", short:"当前没有一份统一的公开保留期政策适用于所有 AERTEX 产品。", body:["不同数据类型的生命周期目前由对应产品实现决定，例如会话、文件、文档、Watch 事件和审计记录并不必然使用同一个保留周期。","在正式 retention policy 发布前，不应给出“全部保存 X 天”这类未经实现和政策确认的数字。"]},
    en:{q:"How long does AERTEX retain data?", short:"There is currently no single published retention policy that applies one duration to every AERTEX product.", body:["Different data types currently follow the lifecycle of their respective product implementations; conversations, files, documents, Watch events, and audit records do not necessarily share one retention period.","Until a formal retention policy is published, AERTEX should not invent a universal number such as “all data is kept for X days.”"]}
  },
  {
    id:"10000025-abcd-4abc-8abc-0abcdef12345", category:"privacy",
    zh:{q:"如何删除 AERTEX 中的数据？", short:"当前应在保存该数据的具体产品中使用对应的删除功能；并不存在一个已经公开的“清空所有 AERTEX 数据”统一按钮。", body:["例如 Drive 文件、部分 Work 内容、项目任务和 Intelligence 会话具有各自的删除操作；Watch 当前则没有公开的“删除全部云端活动数据”接口。","删除能力和影响范围必须按产品分别确认，不能把某个产品的 DELETE 操作推断成整个账户的数据清除。"]},
    en:{q:"How can I delete data from AERTEX?", short:"Use the deletion controls of the product that stores the data; there is not currently one public button that erases every category of AERTEX data.", body:["For example, Drive files, some Work content, project/task data, and Intelligence conversations have their own deletion operations, while Watch currently has no public delete-all cloud activity endpoint.","Deletion scope must be verified product by product rather than treating one product's DELETE operation as account-wide erasure."]}
  },
  {
    id:"10000026-bcde-4bcd-8bcd-abcdef123456", category:"privacy",
    zh:{q:"删除哪些 AERTEX 云端数据会影响本地副本？", short:"不能一概而论；是否影响本地副本取决于该产品有没有双向同步或本地桥接逻辑。", body:["以 AERTEX Watch 为例，当前公开 API 甚至没有“删除全部云端活动数据”的功能，因此不能凭空承诺删除云端后本地 ActivityWatch 一定怎样变化。","Work 的本机能力、浏览器缓存和用户手动导出的备份也各有不同语义；每个删除动作都应以当时产品界面的说明为准。"]},
    en:{q:"Which AERTEX cloud deletions affect local copies?", short:"There is no universal rule; the effect on local copies depends on whether a product implements bidirectional synchronization or a local bridge.", body:["For AERTEX Watch, the current public API does not even expose a delete-all cloud activity operation, so the product should not invent promises about how such a deletion would affect local ActivityWatch data.","Work local capabilities, browser caches, and user-exported backups also have different semantics. Each deletion action should be described by the current product UI."]}
  },
  {
    id:"10000027-cdef-4cde-8cde-bcdef1234567", category:"privacy",
    zh:{q:"AERTEX 的隐私政策在哪里？", short:"当前公开站点还没有一份完整、可引用的统一 Privacy Policy 页面覆盖所有产品。", body:["这也是为什么“是否出售数据”“是否训练 AI”“统一保留期”等问题目前不能由 AI 自动补全成承诺。","在正式隐私政策上线后，FAQ 应链接到该政策，并让政策文件成为这些法律与数据处理问题的最高优先级来源。"]},
    en:{q:"Where is the AERTEX Privacy Policy?", short:"The current public site does not yet expose one complete, citable Privacy Policy covering every AERTEX product.", body:["That is why questions such as data sale, AI training, and universal retention periods should not be auto-completed into promises by an AI system.","When a formal Privacy Policy is published, this FAQ should link to it and treat the policy as the highest-priority source for legal and data-processing questions."]}
  },
  {
    id:"10000028-def0-4def-8def-cdef12345678", category:"compatibility",
    zh:{q:"中国大陆可以访问 AERTEX 吗？", short:"AERTEX 的主站和主要 Web 产品按标准 HTTPS Web 服务提供，但实际可达性仍取决于当时网络环境和具体上游服务。", body:["AERTEX Watch 已专门为简体中文设置流程提供中国大陆下载路径，说明产品会针对大陆网络条件做适配。","对于 Intelligence 等依赖外部 AI provider 的能力，不应把某一时刻的上游可用性概括成永久保证。"]},
    en:{q:"Can AERTEX be accessed from Mainland China?", short:"AERTEX's main site and core web products are delivered as standard HTTPS web services, but real-world reachability can still depend on the current network environment and specific upstream services.", body:["AERTEX Watch provides a Mainland China download path in its Simplified Chinese setup flow, reflecting product-specific network adaptation.","For capabilities such as Intelligence that depend on external AI providers, temporary upstream availability should not be turned into a permanent guarantee."]}
  },
  {
    id:"10000029-ef01-4ef0-8ef0-def123456789", category:"compatibility",
    zh:{q:"中国大陆用户怎么下载 ActivityWatch？", short:"简体中文 AERTEX Watch 设置页当前优先提供 iCloud 中国大陆下载链接。", body:["这样做是为了避免把大陆用户强制引导到可能不稳定的 GitHub Releases 下载链路。","其他地区的设置页则可以继续使用 ActivityWatch 官方下载页；实际入口以当前 AERTEX Watch 设置页为准。"]},
    en:{q:"How do Mainland China users download ActivityWatch?", short:"The Simplified Chinese AERTEX Watch setup page currently prefers an iCloud China download link.", body:["This avoids forcing Mainland users through a GitHub Releases download path that may be unreliable in some network conditions.","Setup pages for other regions can continue to use the official ActivityWatch download page; the current AERTEX Watch setup page is the source of truth."]}
  },
  {
    id:"10000030-f012-4f01-8f01-ef1234567890", category:"compatibility",
    zh:{q:"中国大陆用户怎么下载 AERTEX Watch Sync？", short:"AERTEX Watch Sync 由 AERTEX 自己的 Watch 域名直接提供，不需要去第三方仓库寻找。", body:["当前脚本地址由 aw.qsseda.com 提供，设置教程会给出下载和 PowerShell 运行方式。","预览版需要 Node.js 18 或更高版本；Windows 指南推荐使用 PowerShell 7。"]},
    en:{q:"How do Mainland China users download AERTEX Watch Sync?", short:"AERTEX Watch Sync is served directly from AERTEX's own Watch domain rather than requiring users to find it in a third-party repository.", body:["The current script is served from aw.qsseda.com, and the setup guide provides download and PowerShell run instructions.","The preview requires Node.js 18 or newer, and the Windows guide recommends PowerShell 7."]}
  },
  {
    id:"10000031-0123-4012-8012-f12345678901", category:"compatibility",
    zh:{q:"为什么 AERTEX Watch 的中国大陆教程不优先使用 GitHub 下载？", short:"主要是为了提高下载可达性和减少网络波动，而不是因为 ActivityWatch 不是开源项目。", body:["ActivityWatch 仍然是独立的开源项目；AERTEX 只是为中国大陆设置流程提供一个更容易访问的下载来源。","AERTEX Watch Sync 本身则直接从第一方 aw.qsseda.com 提供，避免让普通用户在多个仓库和 Release 页面之间寻找文件。"]},
    en:{q:"Why doesn't the Mainland China AERTEX Watch guide prefer GitHub downloads?", short:"The main reason is download reachability and network reliability, not because ActivityWatch is not open source.", body:["ActivityWatch remains an independent open-source project; AERTEX simply provides a more reachable download source for the Mainland setup flow.","AERTEX Watch Sync itself is served from the first-party aw.qsseda.com domain so users do not need to search across repositories and Releases pages."]}
  },
  {
    id:"10000032-1357-4135-8135-13579bdf2468", category:"compatibility",
    zh:{q:"AERTEX 支持哪些浏览器？", short:"AERTEX 主要面向现代浏览器；当前代码会识别并适配 Chrome、Edge、Firefox、Safari 等常见浏览器，但没有发布一份固定的最低版本支持矩阵。", body:["Web 功能依赖现代 JavaScript、Fetch、Web API 和安全 Cookie 等浏览器能力，因此过旧浏览器可能无法完整工作。","需要特定能力的页面，例如本机桥接或二维码识别，还可能依赖额外浏览器 API；应以对应功能页面的实际检测结果为准。"]},
    en:{q:"Which browsers does AERTEX support?", short:"AERTEX targets modern browsers. The current code recognizes common browsers such as Chrome, Edge, Firefox, and Safari, but there is no published fixed minimum-version support matrix.", body:["Web features depend on modern JavaScript, Fetch, Web APIs, and secure-cookie behavior, so very old browsers may not work completely.","Pages that need special capabilities, such as local bridging or QR decoding, can depend on additional browser APIs. Their own capability checks are the source of truth."]}
  },
  {
    id:"10000033-2468-4246-8246-2468ace13579", category:"compatibility",
    zh:{q:"AERTEX 支持哪些操作系统？", short:"大多数 AERTEX 产品通过浏览器使用，因此可在能运行现代浏览器的主流桌面和移动系统上访问；本机组件则有各自的系统要求。", body:["Windows、macOS、Linux、iOS/iPadOS 和 Android 都可以作为 Web 访问环境，但这不代表每个平台都有 AERTEX 原生客户端。","例如 Watch Sync 是电脑端脚本工具，Work 的本机桥接当前以 Windows 为主要完整目标。"]},
    en:{q:"Which operating systems does AERTEX support?", short:"Most AERTEX products are accessed through a browser and therefore work across major desktop and mobile systems that support a modern browser; local components have their own platform requirements.", body:["Windows, macOS, Linux, iOS/iPadOS, and Android can all be web-access environments, but that does not mean AERTEX ships a native app for every platform.","For example, Watch Sync is a computer-side script tool, while Work's local bridge currently targets Windows as the primary full desktop environment."]}
  },
  {
    id:"10000034-3579-4357-8357-3579bdf2468a", category:"compatibility",
    zh:{q:"AERTEX Watch Sync 当前支持哪些系统？", short:"Watch Sync 是 Node.js 脚本，当前官方设置教程重点覆盖 Windows + PowerShell 7；其他桌面系统能否运行取决于 Node.js 和 ActivityWatch 本机 API 环境。", body:["同步器本身使用 Node.js、HTTP 请求和本机状态文件，没有把代码硬编码成只能在 Windows 运行。","但“理论可运行”和“官方完成教程与验证”是两回事；当前公开指南应把 Windows 作为主要经过说明的路径。"]},
    en:{q:"Which systems does AERTEX Watch Sync currently support?", short:"Watch Sync is a Node.js script. The official setup guide currently focuses on Windows with PowerShell 7; use on other desktop systems depends on Node.js and a reachable local ActivityWatch API.", body:["The sync code itself uses Node.js, HTTP requests, and a local state file and is not hard-coded to run only on Windows.","However, theoretical portability is not the same as an officially documented and tested path. The current public guide should treat Windows as the primary documented setup."]}
  },
  {
    id:"10000035-468a-4468-8468-468ace13579b", category:"compatibility",
    zh:{q:"AERTEX 的 Web 页面和本机组件分别负责什么？", short:"Web 页面负责账户、内容、查询和可视化；本机组件只在需要访问电脑本地能力时参与。", body:["例如 AERTEX Watch 网页负责账户、令牌、状态和活动数据查看，而 Watch Sync 在电脑上连接 127.0.0.1:5600 并上传 ActivityWatch 事件。","AERTEX Work 的本机桥接则用于需要本地 TeX 或其他电脑能力的场景。把这些本机组件称为完整的 AERTEX 原生客户端并不准确。"]},
    en:{q:"What do AERTEX web pages and local components each do?", short:"Web pages handle accounts, content, queries, and visualization; local components participate only when a feature needs access to capabilities on the user's computer.", body:["For example, the AERTEX Watch web interface handles the account, device tokens, status, and activity viewing, while Watch Sync connects to 127.0.0.1:5600 on the computer and uploads ActivityWatch events.","AERTEX Work's local bridge is used for scenarios that need local TeX or other computer capabilities. These local components should not automatically be described as full native AERTEX clients."]}
  }

]);

export const QUESTION_CATEGORIES = Object.freeze({
  about:{zh:"关于 AERTEX",en:"About AERTEX"},
  account:{zh:"AERTEX Account",en:"AERTEX Account"},
  products:{zh:"AERTEX Work / Intelligence / Cash",en:"AERTEX Work / Intelligence / Cash"},
  watch:{zh:"AERTEX Watch",en:"AERTEX Watch"},
  privacy:{zh:"隐私与数据",en:"Privacy & Data"},
  compatibility:{zh:"中国大陆与兼容性",en:"Mainland China & Compatibility"}
});

const QUESTION_BY_ID = new Map(QUESTIONS.map(item => [item.id, item]));

export function publicQuestions() {
  return QUESTIONS;
}

export function publicQuestion(id) {
  return QUESTION_BY_ID.get(String(id || "").toLowerCase()) || null;
}

export function questionLanguage(locale) {
  return String(locale || "").toLowerCase() === "zh-cn" ? "zh" : "en";
}

export function questionLocale(locale) {
  return String(locale || "").toLowerCase().startsWith("zh") ? "zh-cn" : "en-us";
}

export function questionSitemapUrls() {
  const urls = [
    "https://qsseda.com/zh-cn/q",
    "https://qsseda.com/en-us/q"
  ];
  for (const item of QUESTIONS) {
    urls.push("https://qsseda.com/zh-cn/q/" + item.id);
    urls.push("https://qsseda.com/en-us/q/" + item.id);
  }
  return urls;
}
