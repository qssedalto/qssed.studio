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
    id:"fc76c5bb-97f6-485c-a090-37021fc5b105", category:"cash",
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
    id:"49cf0116-603b-455e-85a9-e6ee982e7108", category:"intelligence",
    zh:{q:"AERTEX Intelligence 会自动读取 AERTEX Work 里的文档吗？", short:"当前不会因为使用同一个账号而自动读取 Work 文档。", body:["当前公开实现没有把“统一账户”设计成 Intelligence 对 Work 文档的自动访问授权。","如果未来加入明确的文档导入或跨产品读取功能，应当以当时的产品界面、权限提示和官方说明为准。"]},
    en:{q:"Does AERTEX Intelligence automatically read documents from AERTEX Work?", short:"No. Sharing an account does not currently make Work documents automatically available to Intelligence.", body:["The current public implementation does not treat the shared account as automatic authorization for Intelligence to read Work documents.","If an explicit document-import or cross-product feature is added later, the product UI, permission prompt, and current official documentation will define its behavior."]}
  },
  {
    id:"af4b4188-1fa2-47cf-a71f-f8418e496109", category:"intelligence",
    zh:{q:"AERTEX Intelligence 可以自动访问 AERTEX Watch 的电脑活动记录吗？", short:"当前没有自动读取 Watch 活动记录的产品能力。", body:["Watch 的活动数据和 Intelligence 的 AI 对话是不同的产品数据流。","不能仅因为二者使用同一个 AERTEX Account，就认为 AI 会扫描或分析你的电脑活动时间线。"]},
    en:{q:"Can AERTEX Intelligence automatically access AERTEX Watch activity records?", short:"There is currently no product feature that automatically reads Watch activity records into Intelligence.", body:["Watch activity data and Intelligence conversations are separate product data flows.","Using the same AERTEX Account does not mean the AI scans or analyzes your computer activity timeline."]}
  },
  {
    id:"14b52906-885b-4e26-b79f-c92c3349d110", category:"pricing",
    zh:{q:"AERTEX 有免费计划和付费计划吗？", short:"有。AERTEX 当前建立了 Free 与多档存储订阅计划。", body:["当前订阅目录包含 Free、Mini、Plus、Pro、Max、Ultra、Studio 和 Vault 等层级，主要用于定义 AERTEX Drive 的存储权益。","不同计划的价格、学生价格、可购买状态和权益可能调整，应以账户中的“订阅与权益”页面实时显示为准。"]},
    en:{q:"Does AERTEX have free and paid plans?", short:"Yes. AERTEX currently has a Free plan and multiple storage subscription tiers.", body:["The current subscription catalog includes Free, Mini, Plus, Pro, Max, Ultra, Studio, and Vault tiers, primarily defining AERTEX Drive storage entitlements.","Prices, student pricing, checkout availability, and entitlements can change, so the Subscription & Entitlements page in the account is the current source of truth."]}
  },
  {
    id:"533fd590-6a35-45fd-9952-6680a5b9a111", category:"pricing",
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
    id:"c8b06f69-a5f1-46aa-80c2-7de84ba78124", category:"work",
    zh:{q:"AERTEX Work 是什么？", short:"AERTEX Work 是 AERTEX 的独立工作产品，当前包含文档与 TeX 等工作能力。", body:["AERTEX 主站还包含项目、任务、草稿、Workbench 等工作区能力；独立 Work 产品当前重点提供 TeX 文档和本机能力衔接。","具体可用功能会随着产品迭代变化，应以当前 Work 界面为准。"]},
    en:{q:"What is AERTEX Work?", short:"AERTEX Work is an independent AERTEX work product, currently including document and TeX-oriented capabilities.", body:["The AERTEX main site also contains projects, tasks, drafts, and Workbench workspace features. The independent Work product currently focuses on TeX documents and local capability integration.","Available features can evolve, so the current Work interface is the source of truth."]}
  },
  {
    id:"12c0c5e9-67c3-4acf-88f9-597f93c55125", category:"cash",
    zh:{q:"AERTEX Cash 是做什么的？", short:"AERTEX Cash 用于个人现金流、预算和预测。", body:["它可以保存与账户关联的现金流数据，并支持备份导入导出等个人财务管理流程。","Cash 是独立产品，不应与 Work 文档、Watch 活动记录或 Intelligence 对话自动混为同一份数据。"]},
    en:{q:"What does AERTEX Cash do?", short:"AERTEX Cash is for personal cashflow, budgeting, and forecasting.", body:["It can store account-associated cashflow data and supports personal-finance workflows such as backup export and import.","Cash is an independent product; its data should not be assumed to merge automatically with Work documents, Watch activity records, or Intelligence conversations."]}
  },
  {
    id:"80169b25-42c4-41b5-8b0d-e841be8b5126", category:"intelligence",
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
  }
]);

export const QUESTION_CATEGORIES = Object.freeze({
  about:{zh:"关于 AERTEX",en:"About AERTEX"},
  account:{zh:"账户与产品边界",en:"Account & product boundaries"},
  pricing:{zh:"订阅与权益",en:"Subscriptions & entitlements"},
  work:{zh:"AERTEX Work",en:"AERTEX Work"},
  cash:{zh:"AERTEX Cash",en:"AERTEX Cash"},
  intelligence:{zh:"AERTEX Intelligence",en:"AERTEX Intelligence"},
  watch:{zh:"AERTEX Watch",en:"AERTEX Watch"},
  compatibility:{zh:"兼容性与语言",en:"Compatibility & languages"}
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
