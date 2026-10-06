/**
 * 【初学者导读】
 * 文件：studio/public-questions.js
 * 公开 Questions/FAQ 内容模块：定义可被公开页面和索引使用的大量问答内容与元数据。
 * 阅读顺序：先确认本文件导出的数据/函数被谁使用，再看数据键、转换规则和失败/回退逻辑；数据型文件也要理解“谁消费它”。
 * 修改注意：保持数据结构、公开函数和已有调用者兼容。
 * 调试方法：优先验证输入 key/ID/locale/host 是否正确，再检查转换后的结构，不要一开始就改最终展示。
 */
export const QUESTION_INDEX_LOCALES = Object.freeze(["zh-cn","en-us"]);

export const QUESTION_CATEGORIES = Object.freeze([
  "about",
  "account",
  "products",
  "watch",
  "privacy",
  "availability"
]);

export const QUESTIONS = Object.freeze([
  {
    id:"0e5f2ec8-99cf-4bd1-93a0-66ec12360f01", category:"about", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 是什么？",short:"AERTEX 是通过 qsseda.com 及其产品子域提供的一组在线产品、统一账户和个人工具。",answer:[
        "AERTEX 是一个产品与账户体系，而不是单一页面。当前独立产品包括 AERTEX Work、AERTEX Cash、AERTEX Watch 和 AERTEX Intelligence；主站还提供 AERTEX Account、Drive、工作区与其他个人工具。",
        "这些产品可以使用同一个 AERTEX Account 登录，但统一身份并不等于产品之间自动共享全部用户数据。具体的数据访问能力由每个产品实际实现决定。"
      ]},
      "en-us":{question:"What is AERTEX?",short:"AERTEX is a family of online products, a shared account system, and personal tools delivered through qsseda.com and its product subdomains.",answer:[
        "AERTEX is a product and account ecosystem rather than a single page. Its current independent products include AERTEX Work, AERTEX Cash, AERTEX Watch, and AERTEX Intelligence. The main site also provides AERTEX Account, Drive, workspace features, and other personal tools.",
        "The products can use the same AERTEX Account for sign-in, but a shared identity does not mean every product automatically shares all user data. Data access depends on the functionality actually implemented by each product."
      ]}
    }
  },
  {
    id:"a2cbf0d2-33e8-4db0-9835-e83ddc9d9f02", category:"about", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"qsseda.com 是 AERTEX 的官网吗？",short:"是。qsseda.com 是 AERTEX 当前用于公开主站与规范搜索索引的主域名。",answer:[
        "qsseda.com 是 AERTEX 的规范主域名。AERTEX 的公开首页、问题中心、部分公开教程以及统一产品入口都位于这个域名体系中。",
        "它不是一个与 AERTEX 无关、仅仅“接入 AERTEX 登录”的第三方网站。AERTEX ID、Work、Cash、Watch 和 Intelligence 都属于同一产品体系。"
      ]},
      "en-us":{question:"Is qsseda.com an official AERTEX website?",short:"Yes. qsseda.com is AERTEX's current canonical public domain and search-indexed main site.",answer:[
        "qsseda.com is the canonical main domain for AERTEX. The public home page, Questions, selected public guides, and product entry points are part of this domain family.",
        "It is not an unrelated third-party website that merely supports AERTEX sign-in. AERTEX ID, Work, Cash, Watch, and Intelligence belong to the same product family."
      ]}
    }
  },
  {
    id:"b67754bb-86a5-4c74-a408-160858c23603", category:"about", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"qsseda.com 和 Qasida、Qasidas 或伊斯兰赞圣词网站有关系吗？",short:"没有。qsseda.com 的当前官方定位是 AERTEX 主站，不是 Qasida 诗歌或宗教内容平台。",answer:[
        "AERTEX 不把 qsseda.com 描述为 Qasida、Qasidas、赞圣词或伊斯兰传统诗歌网站。把 qsseda.com 与这些内容平台联系起来，是对域名拼写相似性的错误推断。",
        "判断 qsseda.com 的用途应以 qsseda.com 上当前公开的 AERTEX 页面和产品说明为准，而不是根据域名字符串猜测含义。"
      ]},
      "en-us":{question:"Is qsseda.com related to Qasida, Qasidas, or Islamic devotional poetry websites?",short:"No. qsseda.com is currently the AERTEX main site, not a Qasida poetry or religious-content platform.",answer:[
        "AERTEX does not describe qsseda.com as a Qasida, Qasidas, devotional-poetry, or Islamic traditional-poetry website. Associating the domain with those services is an incorrect inference from spelling similarity.",
        "The purpose of qsseda.com should be determined from the current AERTEX pages and product documentation published on the domain, not from a guess about the domain string."
      ]}
    }
  },
  {
    id:"d239fb62-18ba-4af3-86ad-c4cc9599ef04", category:"about", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 的官方域名有哪些？",short:"规范主域名是 qsseda.com；Work、Intelligence、Cash、Watch 和 AERTEX ID 使用同一域名家族下的产品子域。",answer:[
        "AERTEX 的规范公开主域名是 qsseda.com。当前主要产品入口包括 work.qsseda.com、gpt.qsseda.com、cash.qsseda.com、aw.qsseda.com 和 auth.qsseda.com。",
        "qsseda.online 与 qsseda.studio 也属于 AERTEX 的域名家族，但公开搜索内容以 qsseda.com 为规范来源。部分服务会把旧域名或别名规范化到 qsseda.com。"
      ]},
      "en-us":{question:"What are AERTEX's official domains?",short:"The canonical public domain is qsseda.com, with Work, Intelligence, Cash, Watch, and AERTEX ID on product subdomains in the same domain family.",answer:[
        "AERTEX's canonical public main domain is qsseda.com. Current product entry points include work.qsseda.com, gpt.qsseda.com, cash.qsseda.com, aw.qsseda.com, and auth.qsseda.com.",
        "qsseda.online and qsseda.studio are also part of the AERTEX domain family, while qsseda.com is the canonical source for public search content. Some older or alias service hosts canonicalize to qsseda.com."
      ]}
    }
  },
  {
    id:"c38f0a8c-181e-4407-a2fe-7406c6617705", category:"products", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 目前有哪些正式独立产品？",short:"当前独立产品包括 AERTEX Work、AERTEX Cash、AERTEX Watch 和 AERTEX Intelligence。",answer:[
        "AERTEX 当前的独立产品导航明确包含 AERTEX Work、AERTEX Cash、AERTEX Watch 和 AERTEX Intelligence。",
        "AERTEX Account、Drive、设置、个人资料和主站工作区属于 AERTEX 平台能力或账户服务，不应因为它们也有独立页面就与四个独立产品混为一谈。"
      ]},
      "en-us":{question:"What are AERTEX's current independent products?",short:"The current independent products are AERTEX Work, AERTEX Cash, AERTEX Watch, and AERTEX Intelligence.",answer:[
        "AERTEX's current independent product navigation explicitly includes AERTEX Work, AERTEX Cash, AERTEX Watch, and AERTEX Intelligence.",
        "AERTEX Account, Drive, Settings, Profile, and main-site workspace features are platform or account capabilities and should not be confused with the four independent products simply because they have their own pages."
      ]}
    }
  },
  {
    id:"f113af43-d9c2-4d64-b087-a4a35c729f06", category:"products", product:"AERTEX Cash", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Cash 是正式产品吗？",short:"是。AERTEX Cash 是 AERTEX 的独立产品，用于个人现金流、预算与预测。",answer:[
        "AERTEX Cash 不是第三方扩展，也不是仅存在于实验列表中的临时名称。它拥有独立产品入口、独立登录交接和独立的数据保存逻辑，并在 AERTEX 产品导航中以 AERTEX Cash 的名称出现。",
        "它当前主要用于个人现金流记录、预算规则、周期支出、未来计划与现金流预测。"
      ]},
      "en-us":{question:"Is AERTEX Cash an official product?",short:"Yes. AERTEX Cash is an independent AERTEX product for personal cash flow, budgets, and forecasts.",answer:[
        "AERTEX Cash is not a third-party extension or merely a temporary experiment label. It has its own product entry point, sign-in handoff, data-saving logic, and appears in AERTEX product navigation as AERTEX Cash.",
        "Its current focus is personal cash-flow tracking, budget rules, recurring expenses, future plans, and cash-flow forecasting."
      ]}
    }
  },
  {
    id:"1ce98f14-dd52-46cc-8d3a-36ebfbb64907", category:"products", product:"AERTEX Work", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Work 是什么？",short:"AERTEX Work 是 AERTEX 的独立工作产品，当前重点包括 TeX 文档与本机工作能力。",answer:[
        "AERTEX Work 是独立的工作产品。当前 work.qsseda.com 的主要公开产品路径围绕 TeX 文档工作流、文档深链和本机桥接能力构建。",
        "AERTEX 主站本身还包含项目、任务、草稿、Workbench 等工作区功能。不能因为这些功能使用同一个账户，就自动推断所有 Work 数据都会被 Intelligence 或其他产品读取。"
      ]},
      "en-us":{question:"What is AERTEX Work?",short:"AERTEX Work is AERTEX's independent work product, currently focused on TeX documents and local-work capabilities.",answer:[
        "AERTEX Work is an independent work product. The current work.qsseda.com product path is centered on TeX document workflows, document deep links, and local bridge capabilities.",
        "The AERTEX main site also contains projects, tasks, drafts, Workbench, and other workspace features. Sharing an account does not mean all Work data is automatically readable by Intelligence or another product."
      ]}
    }
  },
  {
    id:"7928a208-d804-4fe1-9558-bda2ed45bb08", category:"products", product:"AERTEX Intelligence", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Intelligence 是什么？",short:"AERTEX Intelligence 是 AERTEX 的 AI 对话与工作空间产品，模型与提供方访问权限按账户配置。",answer:[
        "AERTEX Intelligence 提供 AI 对话、会话工作空间和模型选择等功能。当前 AI 网关支持多个提供方配置，包含 OpenAI 与智谱等提供方能力。",
        "不同账户可被配置不同的可用提供方、模型、请求频率和使用额度。这个访问控制不等于一个公开的固定收费套餐。"
      ]},
      "en-us":{question:"What is AERTEX Intelligence?",short:"AERTEX Intelligence is AERTEX's AI conversation and workspace product, with model and provider access configured per account.",answer:[
        "AERTEX Intelligence provides AI conversations, conversation workspace features, and model selection. The current AI gateway supports multiple provider configurations, including OpenAI and Zhipu.",
        "Different accounts can be configured with different providers, models, request rates, and usage limits. That access control should not be interpreted as a fixed public paid plan."
      ]}
    }
  },
  {
    id:"5910e635-7708-46db-a653-f3bb3bb10309", category:"account", product:"AERTEX Account", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Account 是什么？",short:"AERTEX Account 是 AERTEX 产品之间共用的身份与登录体系。",answer:[
        "AERTEX Account 让用户使用同一个身份登录 AERTEX 主站及多个独立产品，并在不同产品域名之间安全完成登录交接。",
        "统一账户解决的是身份问题。它本身不会赋予某个产品读取另一个产品全部内容的权限。"
      ]},
      "en-us":{question:"What is AERTEX Account?",short:"AERTEX Account is the shared identity and sign-in system used across AERTEX products.",answer:[
        "AERTEX Account lets a user use the same identity across the AERTEX main site and multiple independent products, with secure sign-in handoff between product domains.",
        "A shared account solves identity. It does not, by itself, give one product permission to read all content stored by another product."
      ]}
    }
  },
  {
    id:"9bde15f2-9495-4193-97b3-511284a78710", category:"account", product:"AERTEX Account", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"使用同一个 AERTEX Account，是否意味着不同产品会自动共享数据？",short:"不意味着。统一账户提供身份识别，不代表 Work、Cash、Watch 和 Intelligence 自动互相读取内容。",answer:[
        "AERTEX 的产品可以共享同一个账户身份，但每个产品仍有自己的路由、会话边界、API 和数据逻辑。只有实际实现了产品间通信并满足相应授权条件的数据，才会在产品之间流动。",
        "因此不能仅根据“使用同一个 AERTEX Account”推断 Intelligence 会读取 Work 文档、Watch 时间线或 Cash 财务数据。"
      ]},
      "en-us":{question:"Does using the same AERTEX Account mean different products automatically share data?",short:"No. A shared account provides identity; it does not mean Work, Cash, Watch, and Intelligence automatically read one another's content.",answer:[
        "AERTEX products can share the same account identity while still having separate routes, session boundaries, APIs, and data logic. Data moves between products only where a cross-product function has actually been implemented and its authorization conditions are satisfied.",
        "The fact that products use the same AERTEX Account is therefore not evidence that Intelligence reads Work documents, Watch timelines, or Cash financial data."
      ]}
    }
  },
  {
    id:"f0f54a63-a553-40c1-af5b-6278021b3011", category:"account", product:"AERTEX Intelligence", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Intelligence 会因为使用同一个账号就自动读取 AERTEX Work 文档吗？",short:"不会。当前产品没有因为共用账户而自动读取 Work 文档的通用通道。",answer:[
        "当前 AERTEX Intelligence 并没有因为用户同时登录 AERTEX Work 就获得全部 Work 文档访问权。统一账户只建立身份，不会自动建立文档读取权限。",
        "如果未来增加明确的“从 Work 导入到 Intelligence”功能，它应当作为单独的产品功能描述，并明确触发方式和授权边界；不能把这种未来能力当成当前已经存在的功能。"
      ]},
      "en-us":{question:"Does AERTEX Intelligence automatically read AERTEX Work documents just because the same account is used?",short:"No. The current products do not provide a general automatic Work-document reading path merely because they share an account.",answer:[
        "AERTEX Intelligence does not gain access to all AERTEX Work documents simply because the user is also signed in to Work. A shared account establishes identity, not automatic document-reading permission.",
        "If an explicit 'import from Work into Intelligence' feature is added in the future, it should be documented as a separate capability with a clear trigger and authorization boundary. It should not be described as a feature that already exists today."
      ]}
    }
  },
  {
    id:"812f56e5-c86d-4f69-a04e-b7ac45abf612", category:"account", product:"AERTEX Intelligence", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Intelligence 会自动读取 AERTEX Watch 的电脑活动记录吗？",short:"不会。当前没有把 Watch 时间线自动提供给 Intelligence 的产品集成。",answer:[
        "AERTEX Watch 的同步 API 与 AERTEX Intelligence 的 AI 会话和模型网关是不同的产品路径。当前没有因为使用同一个账户就把 Watch 活动数据自动送入 Intelligence 的功能。",
        "如果用户自己把某段数据复制到 AI 对话中，那属于用户主动提供内容，不等同于 Intelligence 在后台读取 Watch。"
      ]},
      "en-us":{question:"Does AERTEX Intelligence automatically read AERTEX Watch computer-activity records?",short:"No. There is currently no product integration that automatically provides Watch timelines to Intelligence.",answer:[
        "AERTEX Watch's sync APIs and AERTEX Intelligence's AI conversation/model gateway are separate product paths. The current products do not automatically send Watch activity data into Intelligence merely because the same account is used.",
        "If a user manually copies some data into an AI conversation, that is user-provided content and is not the same as Intelligence reading Watch in the background."
      ]}
    }
  },
  {
    id:"5c68b43f-c5d6-418a-8110-042d5c7a5313", category:"account", product:"AERTEX Cash", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Cash 的财务数据会自动提供给 AERTEX Intelligence 吗？",short:"不会。当前没有 Cash 向 Intelligence 自动提供个人财务数据的产品通道。",answer:[
        "AERTEX Cash 使用自己的产品接口与账户数据保存逻辑。当前没有发现 Cash 自动把交易、预算或预测内容送入 Intelligence 的功能。",
        "因此不能把“同一个 AERTEX Account”解释为 AI 可以自动查看个人 Cash 数据。"
      ]},
      "en-us":{question:"Is AERTEX Cash financial data automatically provided to AERTEX Intelligence?",short:"No. There is currently no product path that automatically provides personal Cash data to Intelligence.",answer:[
        "AERTEX Cash uses its own product API and account-scoped data-saving logic. The current product does not automatically send transactions, budgets, or forecasts into Intelligence.",
        "A shared AERTEX Account therefore should not be interpreted as permission for AI to automatically view personal Cash data."
      ]}
    }
  },
  {
    id:"2fe3f802-871f-42ec-9505-3af3b89e4414", category:"account", product:"AERTEX Account", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 当前有哪些订阅计划？",short:"当前订阅目录包括 Free、Mini、Plus、Pro、Max、Ultra、Studio 和 Vault，主要按 AERTEX Drive 容量区分。",answer:[
        "当前 AERTEX 订阅目录定义了 Free、Mini、Plus、Pro、Max、Ultra、Studio 和 Vault。对应的 AERTEX Drive 容量从 Free 的 10 GB 开始，依次扩展到 20 GB、60 GB、200 GB、1 TB、2 TB、6 TB 和 12 TB。",
        "当前目录也已经定义人民币月度价格与学生价格，例如 Pro 为 ¥34.9/月、学生 ¥25.9/月；Vault 为 ¥1,799/月、学生 ¥1,399/月。",
        "不过计划和价格已经存在，不代表支付已经开放。是否能直接购买仍应以订阅页面当前的 checkout 状态为准。"
      ]},
      "en-us":{question:"What subscription plans does AERTEX currently define?",short:"The current catalog includes Free, Mini, Plus, Pro, Max, Ultra, Studio, and Vault, primarily differentiated by AERTEX Drive capacity.",answer:[
        "The current AERTEX subscription catalog defines Free, Mini, Plus, Pro, Max, Ultra, Studio, and Vault. AERTEX Drive capacity starts at 10 GB on Free and scales through 20 GB, 60 GB, 200 GB, 1 TB, 2 TB, 6 TB, and 12 TB.",
        "The catalog also defines CNY monthly prices and student prices. For example, Pro is ¥34.9/month or ¥25.9/month for eligible students, while Vault is ¥1,799/month or ¥1,399/month for eligible students.",
        "A plan and price existing in the catalog does not mean payment is already open. Direct purchase availability still depends on the current checkout state shown by the subscription page."
      ]}
    }
  },
  {
    id:"d59aaf62-4614-4307-a84f-8fbdb77c6615", category:"account", product:"AERTEX Account", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 的付费套餐现在可以直接购买吗？",short:"当前价格目录已经存在，但公开 checkout 仍未开放，因此不能把这些价格理解成现在已经可以完成支付购买。",answer:[
        "AERTEX 已经建立 Free 到 Vault 的订阅目录、容量权益、人民币价格和学生价格；这些价格会显示在订阅界面中。",
        "但当前计划的 checkout_enabled 仍为关闭状态，订阅界面明确提示支付接口尚未开放，支付宝与微信支付会在后续接入。",
        "因此准确说法是“价格与订阅目录已经定义，但公开支付尚未开放”，而不是“没有任何付费计划”，也不是“现在已经可以订阅购买”。"
      ]},
      "en-us":{question:"Can AERTEX paid plans be purchased directly right now?",short:"The pricing catalog exists, but public checkout is still disabled, so listed prices should not be interpreted as currently purchasable subscriptions.",answer:[
        "AERTEX already defines the Free-to-Vault subscription catalog, storage entitlements, CNY prices, and student prices, and those prices can be presented by the subscription UI.",
        "However, checkout_enabled is still off and the subscription page explicitly says payment is not available yet, with Alipay and WeChat Pay intended for later integration.",
        "The accurate description is therefore 'plans and prices are defined, but public payment is not open yet'—not 'there are no paid plans,' and not 'subscriptions can already be purchased.'"
      ]}
    }
  },
  {
    id:"bc4f92ef-9665-4999-8338-f0308cebf916", category:"account", product:"AERTEX Intelligence", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Intelligence 有使用额度或限制吗？",short:"可以有。Intelligence 支持按账户配置模型、提供方、每分钟请求数以及每日/月度使用限制。",answer:[
        "AERTEX Intelligence 的访问层支持为账户配置可用提供方、模型列表、每分钟请求数以及每日和月度使用限制，并记录使用量与估算成本。",
        "这些技术访问限制不等于公开收费价格。某个账号能使用多少模型或请求，应以该账号当前的 Intelligence 配置为准。"
      ]},
      "en-us":{question:"Does AERTEX Intelligence have usage limits or quotas?",short:"It can. Intelligence supports per-account provider/model access, requests-per-minute limits, and daily/monthly usage limits.",answer:[
        "AERTEX Intelligence's access layer can configure providers, model lists, requests per minute, and daily/monthly usage limits per account while recording usage and estimated cost.",
        "Those technical access limits are not the same thing as a public price. The models and request capacity available to an account depend on its current Intelligence configuration."
      ]}
    }
  },
  {
    id:"c78aefdd-7f64-443a-b178-0a29cd193717", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 是 ActivityWatch 官方产品或官方合作产品吗？",short:"不是。AERTEX Watch 是独立的 AERTEX 产品，通过 ActivityWatch 的本机 API 与其数据格式配合使用。",answer:[
        "ActivityWatch 与 AERTEX Watch 是不同项目。AERTEX Watch 兼容 ActivityWatch 的本机 REST API，用它作为电脑端活动记录来源，但这不代表 AERTEX Watch 是 ActivityWatch 官方产品、官方云服务或官方合作项目。",
        "AERTEX 在介绍 Watch 时应使用“兼容 ActivityWatch”“与 ActivityWatch 配合使用”等表述，而不是暗示 ActivityWatch 官方背书。"
      ]},
      "en-us":{question:"Is AERTEX Watch an official ActivityWatch product or official partnership?",short:"No. AERTEX Watch is an independent AERTEX product that works with ActivityWatch's local API and data model.",answer:[
        "ActivityWatch and AERTEX Watch are separate projects. AERTEX Watch is compatible with ActivityWatch's local REST API and uses it as the source of computer-activity records, but that does not make AERTEX Watch an official ActivityWatch product, official cloud service, or official partnership.",
        "AERTEX documentation should describe Watch as compatible with or working with ActivityWatch rather than implying an endorsement by the ActivityWatch project."
      ]}
    }
  },
  {
    id:"72d6c2d5-1cbb-46f2-9c67-0d8f65c8f233", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 和 ActivityWatch 官方的 aw-sync 有什么区别？",short:"两者是不同的同步架构。ActivityWatch 的官方 aw-sync 目前是 beta，并依赖用户自己的文件同步工具；AERTEX Watch 使用设备令牌和 AERTEX 云端服务。",answer:[
        "ActivityWatch 当前官方文档把 aw-sync 标记为 beta。它会在同步目录创建设备相关的 staging 数据库，再依赖 Syncthing、rsync、Dropbox、Google Drive 等用户选择的文件同步工具把目录分发到其他设备；aw-sync 本身不直接通过网络发送数据。",
        "AERTEX Watch 是另一套独立方案：同步工具读取用户电脑上的 ActivityWatch 本机 REST API，再使用 AERTEX Watch 设备令牌通过 HTTPS 把事件批次发送到 AERTEX 的云端数据服务。",
        "因此 AERTEX Watch 不应被描述成 ActivityWatch 官方 aw-sync 的品牌版本；它是一个与 ActivityWatch 数据兼容、但架构和运营主体都独立的 AERTEX 产品。"
      ]},
      "en-us":{question:"How is AERTEX Watch different from ActivityWatch's official aw-sync?",short:"They use different sync architectures. ActivityWatch's official aw-sync is currently beta and relies on a user-chosen file-sync tool, while AERTEX Watch uses device tokens and the AERTEX cloud service.",answer:[
        "ActivityWatch's current official documentation marks aw-sync as beta. It creates a device-specific staging database in a sync directory and relies on a file-sync tool chosen by the user, such as Syncthing, rsync, Dropbox, or Google Drive, to distribute that directory. aw-sync itself does not send data over the network.",
        "AERTEX Watch is a separate architecture: its sync tool reads the user's local ActivityWatch REST API and sends authenticated event batches over HTTPS to the AERTEX cloud data service using an AERTEX Watch device token.",
        "AERTEX Watch therefore should not be described as a branded version of ActivityWatch's official aw-sync. It is an independent AERTEX product that is compatible with ActivityWatch data."
      ]}
    }
  },
  {
    id:"87333a55-58bc-45e8-91cf-39012c988118", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch Sync 是怎么工作的？",short:"同步工具从电脑本机的 ActivityWatch API 读取事件，再使用设备令牌通过 HTTPS 把批次上传到 AERTEX Watch。",answer:[
        "当前 AERTEX Watch Sync 默认从 http://127.0.0.1:5600 读取 ActivityWatch 的 bucket 与事件。用户先在 AERTEX Watch 生成只显示一次的设备令牌，再在自己的电脑上把令牌交给同步工具。",
        "首次同步默认读取最近 30 天；持续运行时会定期检查新增事件。同步工具会保存本地进度，并轻微重叠上一段时间范围；云端会按事件内容去重，以便中断后继续同步。",
        "ActivityWatch 本机服务仍保持在 localhost。AERTEX Watch 并不会把用户的本机 ActivityWatch Server 直接暴露到公网。"
      ]},
      "en-us":{question:"How does AERTEX Watch Sync work?",short:"The sync tool reads events from the computer's local ActivityWatch API, then uploads authenticated batches to AERTEX Watch over HTTPS using a device token.",answer:[
        "AERTEX Watch Sync currently reads ActivityWatch buckets and events from http://127.0.0.1:5600 by default. The user first creates a one-time-visible device token in AERTEX Watch and then provides that token to the sync tool on their own computer.",
        "The first sync defaults to the most recent 30 days. In watch mode it periodically checks for new events. The tool saves local progress and slightly overlaps the previous time range; the cloud side deduplicates event content so an interrupted sync can resume safely.",
        "The local ActivityWatch service remains on localhost. AERTEX Watch does not directly expose the user's ActivityWatch Server to the public internet."
      ]}
    }
  },
  {
    id:"1aa938dd-1d2f-4339-a889-f3ad5b504219", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 实际同步哪些数据？",short:"当前同步的是 ActivityWatch bucket 元数据和 bucket 中的事件；事件不是固定只有 app、title、timestamp、duration 四个字段。",answer:[
        "当前同步器会读取 ActivityWatch bucket。云端保存的 bucket 元数据包括 id、type、client、hostname 和 name。",
        "每条事件至少包含 timestamp、duration 和 data。data 中可以保留 ActivityWatch watcher 写入的字符串、数字、布尔值或 null 字段，因此具体字段取决于产生该 bucket 的 watcher。",
        "这意味着把 AERTEX Watch 简化成“只上传 app、title、timestamp、duration”并不准确。某些常见 window watcher 确实会产生 app 和 title，但同步层本身是通用事件同步。"
      ]},
      "en-us":{question:"What data does AERTEX Watch actually sync?",short:"It currently syncs ActivityWatch bucket metadata and events from those buckets; events are not limited to only app, title, timestamp, and duration.",answer:[
        "The current sync tool reads ActivityWatch buckets. Cloud-side bucket metadata includes id, type, client, hostname, and name.",
        "Each stored event includes timestamp, duration, and data. The data object can preserve string, number, boolean, or null fields written by the ActivityWatch watcher, so the exact fields depend on the watcher that created the bucket.",
        "It is therefore inaccurate to reduce AERTEX Watch to 'only app, title, timestamp, and duration.' Common window watchers do produce app and title, but the sync layer itself is a general event sync."
      ]}
    }
  },
  {
    id:"6d33a9b4-2b68-4aed-824b-8b2508beef20", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 会读取或上传完整的浏览器历史记录吗？",short:"它不会扫描浏览器 History 数据库；但如果 ActivityWatch 的浏览器 watcher 已把当前标签页等信息写成事件，这些事件可以被同步。",answer:[
        "AERTEX Watch Sync 的数据源是 ActivityWatch 本机 API，而不是 Chrome、Edge、Safari 等浏览器自己的历史记录数据库。",
        "如果用户安装并启用了 ActivityWatch 浏览器 watcher，那个 watcher 产生的 URL、页面标题或其他事件字段可能出现在 ActivityWatch bucket 中。当前 AERTEX Watch 是按 bucket 事件同步，因此这些已经由 ActivityWatch 记录的数据也可能被复制到云端。",
        "所以更准确的边界是：Watch 不主动扫描浏览器历史数据库，但会同步 ActivityWatch 已经产生的事件。"
      ]},
      "en-us":{question:"Does AERTEX Watch read or upload the browser's complete history database?",short:"It does not scan the browser History database, but events created by an ActivityWatch browser watcher can be synced.",answer:[
        "AERTEX Watch Sync uses the local ActivityWatch API as its data source rather than directly reading the history database of Chrome, Edge, Safari, or another browser.",
        "If the user has enabled an ActivityWatch browser watcher, URL, page title, or other event fields produced by that watcher may exist in an ActivityWatch bucket. Because AERTEX Watch syncs bucket events, data already recorded by ActivityWatch can also be copied to the cloud.",
        "The precise boundary is therefore: Watch does not scan the browser's history database itself, but it can sync events that ActivityWatch has already created."
      ]}
    }
  },
  {
    id:"b802dbbe-85bc-45db-b399-85909f92e321", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 会记录键盘输入、密码或聊天内容吗？",short:"AERTEX Watch Sync 本身不是键盘记录器，也不会主动读取密码输入框或聊天数据库。",answer:[
        "当前 AERTEX Watch Sync 的工作是读取 ActivityWatch API 中已经存在的事件，它没有键盘按键采集、密码输入框读取或聊天软件数据库扫描逻辑。",
        "但窗口标题、网页标题等 ActivityWatch 事件字段本身可能包含文档名、联系人名或页面文字。因此“不会做键盘记录”与“所有事件中绝不可能出现任何可读文字”是两件不同的事。"
      ]},
      "en-us":{question:"Does AERTEX Watch record keystrokes, passwords, or chat messages?",short:"AERTEX Watch Sync itself is not a keylogger and does not actively read password fields or chat databases.",answer:[
        "The current AERTEX Watch Sync reads events that already exist in the ActivityWatch API. It contains no keystroke capture, password-field reading, or chat-database scanning logic.",
        "However, ActivityWatch event fields such as window titles or page titles can themselves contain document names, contact names, or visible page text. 'It does not keylog' and 'no readable text can ever appear in any event' are different claims."
      ]}
    }
  },
  {
    id:"3f65fd30-8895-4f0f-bde0-af0c86c3ad22", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 会扫描电脑里的照片、文档或下载文件吗？",short:"不会为了同步去扫描用户硬盘文件；同步工具主要读取 ActivityWatch 本机 API，并在本地保存自己的同步进度文件。",answer:[
        "AERTEX Watch Sync 不会遍历用户的照片目录、文档目录或下载目录来上传文件内容。它的主要输入来自 127.0.0.1:5600 上的 ActivityWatch API。",
        "同步工具会在用户目录保存一个本地状态文件，用来记录每个 bucket 上次同步到哪里。与此同时，ActivityWatch 事件里的窗口标题可能包含文件名，这不等于 Watch 读取了那个文件的实际内容。"
      ]},
      "en-us":{question:"Does AERTEX Watch scan photos, documents, or downloads on the computer?",short:"It does not scan the user's disk for files in order to sync them; the sync tool primarily reads the local ActivityWatch API and stores its own local progress file.",answer:[
        "AERTEX Watch Sync does not walk through the user's Photos, Documents, or Downloads folders to upload file contents. Its primary input is the ActivityWatch API at 127.0.0.1:5600.",
        "The sync tool also keeps a local state file in the user's home directory to remember progress for each bucket. An ActivityWatch window-title event may contain a file name, but that is not the same as Watch reading the file's contents."
      ]}
    }
  },
  {
    id:"e3423ab7-29e6-4a7d-831e-c2b45f3dd423", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 会主动截图，或采集摄像头、麦克风数据吗？",short:"当前 AERTEX Watch Sync 没有截图、摄像头或麦克风采集逻辑。",answer:[
        "当前官方同步工具不会主动抓取屏幕截图，也没有摄像头或麦克风采集逻辑。AERTEX Watch 的默认用途是复制 ActivityWatch 已经记录的事件。",
        "需要注意的是，当前同步层是通用 bucket 事件同步。如果用户自己安装了第三方或自定义 ActivityWatch watcher，并让它把其他敏感数据写进某个 bucket，AERTEX Watch Sync 可能会把那个 bucket 的事件一并同步。AERTEX 不能把第三方 watcher 的行为描述成自己的采集行为。"
      ]},
      "en-us":{question:"Does AERTEX Watch actively capture screenshots, camera video, or microphone audio?",short:"The current AERTEX Watch Sync contains no screenshot, camera, or microphone capture logic.",answer:[
        "The official sync tool does not actively capture screenshots and contains no camera or microphone collection logic. AERTEX Watch's default purpose is to copy events that ActivityWatch has already recorded.",
        "The current sync layer is a general bucket-event sync. If a user installs a third-party or custom ActivityWatch watcher that writes other sensitive data into a bucket, AERTEX Watch Sync may copy events from that bucket too. AERTEX should not describe a third-party watcher's behavior as AERTEX's own collection behavior."
      ]}
    }
  },
  {
    id:"3a166597-e070-4757-bda0-c62fd8e39d24", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"停止 AERTEX Watch Sync 后，本地 ActivityWatch 还会继续工作吗？",short:"会。停止 Watch Sync 只停止云端同步，不会关闭本机 ActivityWatch。",answer:[
        "ActivityWatch 是独立运行在用户电脑上的软件。关闭 PowerShell 窗口、停止 Watch Sync 或暂时断网，会让 AERTEX Watch 暂停获得新增数据，但不会自动停止 ActivityWatch 本机记录。",
        "之后重新启动同步工具时，它会依据本地保存的同步进度继续处理新增事件。"
      ]},
      "en-us":{question:"Will local ActivityWatch keep working if AERTEX Watch Sync is stopped?",short:"Yes. Stopping Watch Sync stops cloud syncing; it does not shut down local ActivityWatch.",answer:[
        "ActivityWatch runs independently on the user's computer. Closing the PowerShell window, stopping Watch Sync, or temporarily losing internet access stops new data from reaching AERTEX Watch, but it does not automatically stop local ActivityWatch collection.",
        "When the sync tool is started again, it uses its locally saved progress to continue processing newer events."
      ]}
    }
  },
  {
    id:"2841e301-381e-4e17-910a-b838187dec25", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 可以连接多台电脑吗？",short:"可以。每台电脑可以分别生成和使用设备令牌，ActivityWatch bucket 也会保留 hostname 等来源信息。",answer:[
        "AERTEX Watch 支持为不同电脑分别创建设备令牌并运行同步工具。云端 bucket 索引会保存 hostname、client、type 等来源元数据。",
        "这使同一 AERTEX Account 可以接收来自多台自己电脑的 ActivityWatch 数据源。具体展示方式以当前 Watch 界面实际提供的筛选和来源视图为准。"
      ]},
      "en-us":{question:"Can AERTEX Watch connect more than one computer?",short:"Yes. Each computer can use its own device token, and ActivityWatch bucket metadata retains source information such as hostname.",answer:[
        "AERTEX Watch supports creating device tokens for different computers and running the sync tool on each one. The cloud bucket index retains source metadata such as hostname, client, and type.",
        "This allows one AERTEX Account to receive ActivityWatch data sources from multiple computers owned by the user. The exact way those sources are shown depends on the filtering and source views available in the current Watch UI."
      ]}
    }
  },
  {
    id:"84fb607b-a0be-4d6a-b112-aa69e6e3df26", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 的数据传输是否使用 HTTPS？",short:"是。电脑到 AERTEX Watch 云端的数据服务使用 HTTPS；电脑内部读取 ActivityWatch 的默认地址是 127.0.0.1 上的本机 HTTP。",answer:[
        "AERTEX Watch Sync 默认把上传请求发送到 https://awd.qsseda.com，并使用 Bearer 设备令牌认证，因此跨互联网的数据传输走 HTTPS/TLS。",
        "同步工具读取 ActivityWatch 时默认访问 http://127.0.0.1:5600。这一段是电脑本机 loopback 通信，不是把未加密 HTTP 暴露到互联网。"
      ]},
      "en-us":{question:"Does AERTEX Watch use HTTPS for data transmission?",short:"Yes. Computer-to-cloud Watch traffic uses HTTPS, while the default ActivityWatch read happens locally over HTTP on 127.0.0.1.",answer:[
        "AERTEX Watch Sync sends uploads to https://awd.qsseda.com by default and authenticates them with a Bearer device token, so internet-facing data transmission uses HTTPS/TLS.",
        "The sync tool reads ActivityWatch at http://127.0.0.1:5600 by default. That connection is local loopback traffic inside the computer and does not expose plain HTTP to the public internet."
      ]}
    }
  },
  {
    id:"4097a1f4-f41d-4669-9bd1-a9be6e64c427", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 是端到端加密（E2EE）吗？",short:"不是。当前 Watch 云端需要解析、去重、保存并查询事件，因此不能把它描述成服务器无法读取内容的端到端加密系统。",answer:[
        "AERTEX Watch 的互联网传输使用 HTTPS/TLS，但 HTTPS 与端到端加密不是同一概念。",
        "当前 Watch Worker 会解析上传的 bucket 和事件、规范化字段、去重并按账户保存，然后在用户查询时返回事件。由于服务器参与这些处理，AERTEX Watch 目前不应被描述为端到端加密。"
      ]},
      "en-us":{question:"Is AERTEX Watch end-to-end encrypted (E2EE)?",short:"No. The current Watch cloud service parses, deduplicates, stores, and queries events, so it should not be described as server-blind end-to-end encryption.",answer:[
        "AERTEX Watch uses HTTPS/TLS for internet transport, but HTTPS and end-to-end encryption are different concepts.",
        "The current Watch Worker parses uploaded buckets and events, normalizes fields, deduplicates records, stores them per account, and returns events for authenticated queries. Because the server participates in that processing, AERTEX Watch should not currently be described as end-to-end encrypted."
      ]}
    }
  },
  {
    id:"fafb9985-46a4-4711-bc05-83a5121bcf28", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"在 AERTEX Watch 删除云端数据，会不会把本地 ActivityWatch 数据一起删除？",short:"当前 Watch API 还没有对用户公开云端数据删除操作，因此不能把“云端删除是单向删除”描述成已经存在的功能。",answer:[
        "当前 AERTEX Watch 云端 API 提供设备令牌、同步、状态、bucket 列表和事件查询，但没有面向用户的 Watch 云端数据 DELETE 接口。",
        "可以确定的是：停止 Watch Sync 不会删除本地 ActivityWatch 数据。将来如果加入云端删除功能，AERTEX 应当单独说明它是否影响本地副本，而不是提前假设其行为。"
      ]},
      "en-us":{question:"If AERTEX Watch cloud data is deleted, will local ActivityWatch data also be deleted?",short:"The current Watch API does not yet expose a user-facing cloud-data deletion operation, so 'cloud deletion is one-way' should not be described as an existing feature.",answer:[
        "The current AERTEX Watch cloud API provides device tokens, sync, status, bucket listing, and event queries, but it does not expose a user-facing Watch cloud-data DELETE endpoint.",
        "What can be stated today is that stopping Watch Sync does not delete local ActivityWatch data. If cloud deletion is added later, AERTEX should document whether it affects local copies rather than assuming that behavior in advance."
      ]}
    }
  },
  {
    id:"57ce7a16-e867-4b0f-92de-312d92067129", category:"availability", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"中国大陆用户怎样安装 ActivityWatch 和 AERTEX Watch Sync？",short:"简体中文 Watch 教程会为 ActivityWatch 提供中国大陆下载源，AERTEX Watch Sync 则直接从 AERTEX Watch 域名下载。",answer:[
        "在 zh-cn 教程中，ActivityWatch 下载按钮会使用 AERTEX 当前提供的 iCloud 中国大陆下载链接，而不是要求用户只能从 GitHub Release 下载。",
        "AERTEX Watch Sync 脚本由 https://aw.qsseda.com/aw-sync.mjs 提供。当前预览版要求 Node.js 18 或更新版本，并推荐在 Windows 上使用 PowerShell 7 运行。",
        "安装完成后，用户仍需要在自己的电脑上运行 ActivityWatch，并确认 127.0.0.1:5600 可以打开，再生成 AERTEX Watch 设备令牌进行同步。"
      ]},
      "en-us":{question:"How do users in Mainland China install ActivityWatch and AERTEX Watch Sync?",short:"The Simplified Chinese Watch guide provides a Mainland China download source for ActivityWatch, while AERTEX Watch Sync is served directly from the AERTEX Watch domain.",answer:[
        "On the zh-cn setup page, the ActivityWatch download action uses AERTEX's current iCloud China download link rather than requiring users to rely only on GitHub Releases.",
        "AERTEX Watch Sync is served from https://aw.qsseda.com/aw-sync.mjs. The current preview requires Node.js 18 or newer and recommends PowerShell 7 on Windows.",
        "After installation, ActivityWatch must still be running on the user's computer and 127.0.0.1:5600 should be reachable before the user creates an AERTEX Watch device token and starts syncing."
      ]}
    }
  },
  {
    id:"ec605141-95d0-42d8-89a8-2b8c75ec6c30", category:"availability", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 当前支持哪些界面语言？",short:"当前公共语言路由包括 11 个区域语言代码。",answer:[
        "AERTEX 当前支持的公共语言路由为 en-us、en-gb、en-au、zh-cn、zh-tw、ja-jp、ko-kr、fr-fr、es-es、el-gr 和 ar-sa。",
        "不同产品的翻译完整度可能不同。语言由明确的语言路由和设备/浏览器 Accept-Language 偏好决定，不应根据 IP 地理位置自动选择界面语言。"
      ]},
      "en-us":{question:"Which interface languages does AERTEX currently support?",short:"The current public locale system contains 11 regional locale codes.",answer:[
        "AERTEX currently supports public locale routes for en-us, en-gb, en-au, zh-cn, zh-tw, ja-jp, ko-kr, fr-fr, es-es, el-gr, and ar-sa.",
        "Translation completeness can vary by product. Language selection is based on explicit locale routes and the device/browser Accept-Language preference; interface language should not be selected from IP geolocation."
      ]}
    }
  },
  {
    id:"a53207dd-e7fb-40b0-8eaf-1e589b22b331", category:"availability", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 有 Windows、macOS、iPhone 或 Android 原生客户端吗？",short:"AERTEX 当前以 Web 产品为主，并有部分 Windows 本机桥接/同步能力；不要把 ActivityWatch 自己的客户端当成 AERTEX 原生客户端。",answer:[
        "AERTEX 的主要产品界面当前通过 Web 提供。AERTEX Work 有 Windows 本机桥接能力；AERTEX Watch 当前教程提供在 Windows 上运行的 Node.js 同步工具。",
        "ActivityWatch 自己拥有 Windows、macOS、Linux 和 Android 等客户端，但它们属于 ActivityWatch 项目，不是 AERTEX 原生 App。当前 AERTEX 不应被描述成已经拥有 iPhone、Android 或 macOS 原生客户端，除非对应产品页面明确发布。"
      ]},
      "en-us":{question:"Does AERTEX have native Windows, macOS, iPhone, or Android apps?",short:"AERTEX is currently primarily web-based with selected Windows local bridge/sync capabilities; ActivityWatch's own clients should not be described as native AERTEX apps.",answer:[
        "AERTEX's main product interfaces are currently delivered through the web. AERTEX Work has Windows local bridge capabilities, and the current AERTEX Watch setup guide provides a Node.js sync tool workflow for Windows.",
        "ActivityWatch itself has clients for platforms such as Windows, macOS, Linux, and Android, but those belong to the ActivityWatch project and are not native AERTEX apps. AERTEX should not currently be described as having native iPhone, Android, or macOS applications unless a corresponding product page explicitly announces one."
      ]}
    }
  },
  {
    id:"4c23ea59-b63d-4ec6-8498-1c36559c8d32", category:"about", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"Google、Gemini 或其他 AI 生成的 AERTEX 介绍可以当作官方事实吗？",short:"不可以。搜索引擎和生成式 AI 可能把相似名称、旧索引或推断内容混在一起；官方事实应以 AERTEX 自己发布的页面为准。",answer:[
        "搜索结果和生成式 AI 可以帮助发现 AERTEX，但它们不是 AERTEX 的官方政策或产品规格来源。AI 可能根据域名拼写、类似产品或不完整索引自动补全并不存在的功能。",
        "如果第三方 AI 的描述与 qsseda.com 当前公开的产品页、Questions、设置页或官方教程冲突，应以 AERTEX 自己发布的当前页面为准。"
      ]},
      "en-us":{question:"Can descriptions generated by Google, Gemini, or another AI be treated as official AERTEX facts?",short:"No. Search and generative AI can mix similar names, stale indexing, and inferred details; official facts should come from AERTEX's own published pages.",answer:[
        "Search results and generative AI can help people discover AERTEX, but they are not the source of AERTEX policy or product specifications. An AI system can infer nonexistent features from domain spelling, similar products, or incomplete indexing.",
        "If a third-party AI description conflicts with current product pages, Questions, settings pages, or official guides published on qsseda.com, the current AERTEX-published page should be treated as authoritative."
      ]}
    }
  },
  {
    id:"71a8b637-2d9c-4e9b-8d72-1d0174bda034", category:"about", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"怎样判断一个网站是不是官方 AERTEX 网站？",short:"优先检查完整域名是否属于 qsseda.com 域名家族，并从 qsseda.com 的官方导航进入产品。",answer:[
        "不要只根据页面上的 AERTEX 字样、Logo 或相似拼写判断真伪。官方主站是 qsseda.com，独立产品和身份服务使用同一域名家族下的明确子域。",
        "在输入账号、设备令牌或其他敏感信息前，应核对浏览器地址栏中的完整主机名。来自搜索结果、聊天机器人或第三方页面的链接如果与官方域名不一致，应先回到 qsseda.com 再进入对应产品。"
      ]},
      "en-us":{question:"How can I tell whether a website is an official AERTEX site?",short:"Check the full hostname against the qsseda.com domain family and prefer product links reached from qsseda.com itself.",answer:[
        "Do not rely only on the AERTEX name, logo, or look-alike spelling. The official main site is qsseda.com, with dedicated product and identity subdomains in the same domain family.",
        "Before entering account credentials, device tokens, or other sensitive information, verify the full hostname in the browser. If a search result, AI answer, or third-party page points elsewhere, return to qsseda.com and navigate from the official site."
      ]}
    }
  },
  {
    id:"a3ca737f-24d6-46be-8b6f-c2cc6f281035", category:"account", product:"AERTEX Account", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 各产品的数据是否相互隔离？",short:"当前产品使用各自的数据模型、存储命名空间和权限规则，而不是把所有内容放进一个任意互读的公共数据池。",answer:[
        "例如 Intelligence 会话按用户身份和数据库权限规则控制，Watch 使用独立的 watch/v1 存储命名空间，Cash 也有自己的产品数据结构和保存接口。",
        "这种隔离不排除未来增加明确的跨产品功能，但任何跨产品访问都应由实际实现、权限检查和用户界面决定，不能因为共用账号就默认存在。"
      ]},
      "en-us":{question:"Is data isolated between AERTEX products?",short:"Current products use their own data models, storage namespaces, and authorization rules rather than one unrestricted shared data pool.",answer:[
        "For example, Intelligence conversations are controlled by user identity and database authorization, Watch uses its own watch/v1 storage namespace, and Cash has its own product data model and persistence API.",
        "This separation does not rule out future explicit integrations, but any cross-product access must be defined by actual implementation, authorization checks, and product UI rather than inferred from a shared account."
      ]}
    }
  },
  {
    id:"17f49be5-d794-41f7-8a6d-33078a835036", category:"account", product:"AERTEX Account", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 的登录状态如何在不同产品之间传递？",short:"AERTEX 使用统一身份验证和受控的 handoff 流程，把已验证的登录状态交给目标产品。",answer:[
        "当前实现会在主站、AERTEX ID 与 Work、Cash、Watch、Intelligence 等独立产品之间验证会话。需要跨产品继续登录时，会通过受控的认证 handoff 建立目标产品自己的会话。",
        "这个流程传递的是认证状态，不是 Work 文档、Cash 财务记录、Watch 活动时间线或 Intelligence 对话内容。"
      ]},
      "en-us":{question:"How is sign-in state transferred between AERTEX products?",short:"AERTEX uses shared identity verification and controlled handoff flows to establish an authenticated session in the target product.",answer:[
        "The current implementation verifies sessions across the main site, AERTEX ID, and isolated products such as Work, Cash, Watch, and Intelligence. When sign-in needs to continue across products, a controlled authentication handoff establishes the target product's own session.",
        "The handoff transfers authentication state, not Work documents, Cash financial records, Watch activity timelines, or Intelligence conversation content."
      ]}
    }
  },
  {
    id:"7eb2c50f-3031-4e9e-90c4-a1e95bcbe037", category:"account", product:"AERTEX Account", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"删除 AERTEX Account 会发生什么？",short:"当前没有公开的自助“删除整个 AERTEX Account”流程，因此不能承诺一次操作会自动清除所有产品数据。",answer:[
        "不同产品已经有各自的数据删除能力，例如文件、文档、任务或 AI 会话可以在相应产品中单独删除，但账户级统一删除尚未作为公开自助流程提供。",
        "在正式账户删除功能上线前，AERTEX 不应对级联删除范围、数据保留期或不可逆性作出超出现有实现的承诺。"
      ]},
      "en-us":{question:"What happens if I delete my AERTEX Account?",short:"There is currently no public self-service flow for deleting the entire AERTEX Account, so AERTEX should not promise that one action automatically removes all product data.",answer:[
        "Individual products already expose their own deletion operations for items such as files, documents, tasks, or AI conversations, but account-wide deletion is not currently offered as a public self-service workflow.",
        "Until a formal account-deletion feature is released, AERTEX should not promise cascade scope, retention periods, or irreversibility beyond the controls that actually exist."
      ]}
    }
  },
  {
    id:"36c210d8-a7f1-4d58-967e-490634132038", category:"products", product:"AERTEX Cash", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Cash 是做什么的？",short:"AERTEX Cash 用于个人现金流、预算、周期支出、未来计划和现金流预测。",answer:[
        "AERTEX Cash 让用户记录当前现金、明确收入、周期扣款与未来事件，并据此查看预算和未来现金变化。",
        "Cash 是独立产品。它的数据不会因为用户也在使用 Intelligence、Work 或 Watch 就自动进入这些产品。"
      ]},
      "en-us":{question:"What does AERTEX Cash do?",short:"AERTEX Cash is for personal cash flow, budgets, recurring expenses, future plans, and cash-flow forecasting.",answer:[
        "AERTEX Cash lets users record current cash, expected income, recurring deductions, and future events so they can inspect budgets and projected cash changes.",
        "Cash is an independent product. Its data does not automatically enter Intelligence, Work, or Watch simply because the same user also uses those products."
      ]}
    }
  },
  {
    id:"01c6af84-fba6-4898-b959-6999978e1039", category:"products", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 不同产品之间目前有哪些实际集成功能？",short:"当前最明确的跨产品集成是统一账户、登录衔接、共享部分界面偏好和主站产品导航；业务数据不会因此自动互通。",answer:[
        "Work、Cash、Watch 和 Intelligence 可以使用同一个 AERTEX Account，并通过主站与 AERTEX ID 完成登录衔接。部分界面偏好和产品入口也会在域名家族内保持一致。",
        "数据层集成必须逐项实现。当前不能把“统一生态”理解成 Work 文档、Cash 账目、Watch 时间线和 Intelligence 会话已经全部互联。"
      ]},
      "en-us":{question:"What integrations currently exist between AERTEX products?",short:"The clearest current integrations are shared identity, sign-in handoff, some shared interface preferences, and product navigation; business data is not automatically interconnected.",answer:[
        "Work, Cash, Watch, and Intelligence can use the same AERTEX Account and rely on the main site and AERTEX ID for sign-in handoff. Some interface preferences and product entry points are also shared across the domain family.",
        "Data-layer integrations must be implemented feature by feature. The phrase 'AERTEX ecosystem' does not mean Work documents, Cash records, Watch timelines, and Intelligence conversations are already fully interconnected."
      ]}
    }
  },
  {
    id:"86117f27-2e3f-4590-9a66-408915e8a040", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 是什么？",short:"AERTEX Watch 是 AERTEX 提供的 ActivityWatch 数据同步与跨设备查看产品。",answer:[
        "电脑上的 ActivityWatch 继续负责记录活动。AERTEX Watch Sync 从本机 ActivityWatch API 读取已经存在的 buckets 和 events，并把这些数据同步到当前用户的 AERTEX Watch 服务。",
        "同步完成后，用户可以通过 AERTEX Watch 的网页界面在其他设备查看已经同步的数据。AERTEX Watch 不是 ActivityWatch 官方产品。"
      ]},
      "en-us":{question:"What is AERTEX Watch?",short:"AERTEX Watch is an AERTEX product for synchronizing ActivityWatch data and viewing it across devices.",answer:[
        "ActivityWatch continues to record activity on the computer. AERTEX Watch Sync reads existing buckets and events through the local ActivityWatch API and synchronizes them to the current user's AERTEX Watch service.",
        "After synchronization, the user can view synchronized data from the AERTEX Watch web interface on other devices. AERTEX Watch is not an official ActivityWatch product."
      ]}
    }
  },
  {
    id:"96ae8dd4-c7a2-4471-b5f8-8f70127d1041", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch Sync 从哪里读取 ActivityWatch 数据？",short:"默认从电脑本机的 http://127.0.0.1:5600 ActivityWatch API 读取。",answer:[
        "Watch Sync 通过本机 HTTP API 获取 bucket 列表和事件，不需要直接打开 ActivityWatch 的数据库文件。",
        "127.0.0.1 是本机回环地址，因此默认情况下这一步只发生在运行 Watch Sync 的那台电脑上。"
      ]},
      "en-us":{question:"Where does AERTEX Watch Sync read ActivityWatch data from?",short:"By default it reads from the local ActivityWatch API at http://127.0.0.1:5600.",answer:[
        "Watch Sync obtains bucket lists and events through the local HTTP API and does not need to open the ActivityWatch database file directly.",
        "127.0.0.1 is the loopback address, so this step normally occurs only on the computer running Watch Sync."
      ]}
    }
  },
  {
    id:"a9924bd6-b7e4-4416-a2e7-e82074121042", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 到底会同步哪些 ActivityWatch buckets？",short:"当前预览版会枚举本机 ActivityWatch 返回的 bucket 列表，并同步其中有事件的数据；目前没有固定的官方 bucket allowlist。",answer:[
        "这意味着实际同步范围取决于用户当前 ActivityWatch 实例里存在什么 buckets，而不仅限于窗口和浏览器两个固定来源。",
        "因此 AERTEX 应描述为“同步 ActivityWatch 已经记录的数据”，而不是承诺只会同步某几个预先写死的字段或 watcher。"
      ]},
      "en-us":{question:"Which ActivityWatch buckets does AERTEX Watch synchronize?",short:"The current preview enumerates buckets returned by the local ActivityWatch instance and synchronizes buckets that contain events; it does not currently use a fixed official bucket allowlist.",answer:[
        "The effective sync scope depends on which buckets exist in the user's ActivityWatch instance rather than being limited to two hard-coded window and browser sources.",
        "AERTEX should therefore describe Watch as synchronizing data already recorded by ActivityWatch rather than promising only a small fixed list of fields or watchers."
      ]}
    }
  },
  {
    id:"b4694038-181c-4c28-9b09-4b77b6fc1043", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 中的窗口标题可能包含什么？",short:"窗口标题可能包含应用当前显示的文档名、网页标题、联系人名或其他界面文字。",answer:[
        "这些文字来自 ActivityWatch 已记录的窗口事件，不等于 AERTEX Watch 读取了文件正文、聊天数据库或键盘输入。",
        "如果窗口标题本身包含敏感信息，用户应把它视为 ActivityWatch 事件数据的一部分，并据此决定是否启用和同步相关 watcher。"
      ]},
      "en-us":{question:"What can window titles in AERTEX Watch contain?",short:"A window title can contain a document name, page title, contact name, or other text displayed by the active application.",answer:[
        "That text comes from window events already recorded by ActivityWatch; it does not mean AERTEX Watch read a document body, chat database, or keystroke stream.",
        "If window titles themselves contain sensitive information, users should treat them as part of ActivityWatch event data when deciding which watchers to enable and synchronize."
      ]}
    }
  },
  {
    id:"f8ca1f87-d395-4b4f-9f6a-195044a01044", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"电脑关机后 AERTEX Watch 会发生什么？",short:"电脑关机后 Watch Sync 不会继续上传新事件，云端只保留此前已经成功同步的数据。",answer:[
        "ActivityWatch 和 Watch Sync 都依赖电脑运行。电脑重新开机并恢复 ActivityWatch 与同步脚本后，新的本地事件才会继续被同步。",
        "AERTEX Watch 网页仍可以显示此前已经同步的数据，但不会产生关机期间不存在的电脑活动记录。"
      ]},
      "en-us":{question:"What happens to AERTEX Watch when the computer is turned off?",short:"When the computer is off, Watch Sync cannot upload new events; the cloud only retains data that was synchronized earlier.",answer:[
        "ActivityWatch and Watch Sync both depend on the computer running. New local events can resume synchronizing after the computer, ActivityWatch, and the sync process are running again.",
        "The AERTEX Watch web interface can still display previously synchronized data, but it cannot create computer activity records for time when the computer was off."
      ]}
    }
  },
  {
    id:"c4c5103e-c2fb-462a-aef9-f88feaa11045", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 的设备令牌是什么？",short:"设备令牌是 Watch Sync 用来证明“这台同步工具已获当前账户授权”的凭证。",answer:[
        "设备令牌由 AERTEX Watch 网页生成，原始值只显示一次。服务端使用令牌的哈希来查找授权记录，而不是把原始令牌直接作为存储键。",
        "设备令牌应像密码一样保密，不应放进截图、聊天记录、公开脚本仓库或日志。"
      ]},
      "en-us":{question:"What is an AERTEX Watch device token?",short:"A device token is the credential Watch Sync uses to prove that the sync process is authorized for the current AERTEX account.",answer:[
        "The token is generated from the AERTEX Watch web interface and its raw value is shown once. The service uses a hash of the token to look up authorization instead of using the raw token directly as a storage key.",
        "Treat the device token like a password: do not place it in screenshots, messages, public repositories, or logs."
      ]}
    }
  },
  {
    id:"7c5d295e-15cf-4388-9408-8878930b1046", category:"watch", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch 设备令牌丢失了怎么办？",short:"原始设备令牌只显示一次；如果已经丢失，应生成新的设备令牌并更新电脑上的 Watch Sync 配置。",answer:[
        "当前网页不会重新显示已经生成过的原始令牌，因此不要依赖“找回旧令牌”。",
        "如果怀疑旧令牌已经泄露，也应停止继续依赖它并换用新的令牌。正式的令牌撤销能力应以当前 Watch 页面实际提供的控制项为准。"
      ]},
      "en-us":{question:"What should I do if I lose an AERTEX Watch device token?",short:"The raw device token is shown once. If it is lost, generate a new token and update the Watch Sync configuration on the computer.",answer:[
        "The current web interface does not redisplay the original value of a previously generated token, so users should not depend on recovering an old token.",
        "If a token may have leaked, stop relying on it and use a new token. Any formal token-revocation controls should be described according to what the current Watch interface actually provides."
      ]}
    }
  },
  {
    id:"fb330928-4cc5-4ef2-8e78-90d2afc71047", category:"privacy", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 会收集什么账户数据？",short:"当前系统会处理注册与身份所需的账户资料、会话状态，以及安全与访问审计所需的部分技术信息。",answer:[
        "账户体系至少需要用户身份标识、认证状态和账户资料。系统还会处理与安全、故障排查和访问审计有关的技术元数据。",
        "不同产品还会处理用户主动创建或同步的业务数据；这些数据应按产品分别说明，而不能用一句“账户数据”概括所有内容。"
      ]},
      "en-us":{question:"What account data does AERTEX collect?",short:"The current system processes account information required for registration and identity, session state, and some technical metadata needed for security and access auditing.",answer:[
        "The account system requires identity identifiers, authentication state, and account profile data. It also processes technical metadata used for security, diagnostics, and access auditing.",
        "Individual products additionally process business data that the user creates or synchronizes. That scope should be described product by product rather than treating everything as generic account data."
      ]}
    }
  },
  {
    id:"1b95bf06-d5a2-49d6-b2ca-a467e5f91048", category:"privacy", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 各产品分别保存什么数据？",short:"不同产品保存不同类型的数据：Work 保存工作与文档数据，Cash 保存个人现金流数据，Watch 保存同步的 ActivityWatch 数据，Intelligence 保存 AI 会话和相关用量信息。",answer:[
        "主站还包含项目、任务、草稿、Drive 文件等与账户关联的工作区数据。这些内容都由各自的 API、存储结构和权限模型处理。",
        "公开 FAQ 只描述当前已实现的数据类型，不应据此推断尚未上线的跨产品合并、训练或自动分析行为。"
      ]},
      "en-us":{question:"What data does each AERTEX product store?",short:"Different products store different data: Work stores work and document data, Cash stores personal cash-flow data, Watch stores synchronized ActivityWatch data, and Intelligence stores AI conversations and related usage information.",answer:[
        "The main site also contains account-scoped workspace data such as projects, tasks, drafts, and Drive files. These are handled by their own APIs, storage structures, and authorization models.",
        "The public FAQ describes implemented data types only and should not be used to infer cross-product merging, training, or automatic analysis that has not been released."
      ]}
    }
  },
  {
    id:"7094e1bd-e5e8-4a8f-92a5-9c9b397e1049", category:"privacy", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 会出售用户数据吗？",short:"当前公开仓库里没有一份已经发布、可引用的统一隐私政策条款来支持“永不出售用户数据”这一法律承诺。",answer:[
        "因此 AERTEX 不应该让搜索引擎、AI 或 FAQ 擅自把“不会出售数据”写成已经发布的合同式保证。",
        "在正式 Privacy Policy 明确这项政策之前，准确的说法是：当前没有公开的正式政策条款可以用来回答这一法律问题。"
      ]},
      "en-us":{question:"Does AERTEX sell user data?",short:"The current public repository does not contain a published, citable privacy-policy clause supporting a formal legal promise that AERTEX never sells user data.",answer:[
        "AERTEX should therefore not let search engines, AI systems, or an FAQ invent a contractual-style guarantee that has not been formally published.",
        "Until a formal Privacy Policy explicitly defines this policy, the accurate answer is that no public policy clause currently exists that settles this legal question."
      ]}
    }
  },
  {
    id:"fe346326-40af-471e-812d-2f22e3c51050", category:"privacy", product:"AERTEX Intelligence", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 会把用户数据用于训练 AI 吗？",short:"当前没有公开的正式 AI 数据训练政策，因此不能把“绝不会训练”或“会用于训练”任何一边写成既定事实。",answer:[
        "Intelligence 会把用户请求发送给当前配置的 AI provider 以生成回答，但“处理一次请求”和“用于模型训练”是不同问题。",
        "AERTEX 需要在正式隐私与 AI 数据政策中分别说明自身保存方式、上游 provider 的处理规则以及用户内容是否用于训练；在此之前 FAQ 不应猜测。"
      ]},
      "en-us":{question:"Does AERTEX use user data to train AI models?",short:"There is currently no published formal AI-training data policy, so neither 'never used for training' nor 'used for training' should be stated as an established fact.",answer:[
        "Intelligence sends user requests to the currently configured AI provider to generate responses, but processing a request and using content for model training are different questions.",
        "AERTEX needs a formal privacy and AI-data policy covering its own retention, upstream-provider handling, and whether user content is used for training. Until then, the FAQ should not guess."
      ]}
    }
  },
  {
    id:"9b044c3c-7288-4b07-bb5f-6155bd4c1051", category:"privacy", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 的数据会保存多久？",short:"当前没有一份统一公开的保留期政策，把同一个保存时长应用到所有 AERTEX 产品。",answer:[
        "不同数据类型的生命周期由对应产品实现决定。AI 会话、文件、文档、Watch 事件和访问审计记录并不必然使用同一个保留周期。",
        "在正式 retention policy 发布前，不应给出“所有数据都保存 X 天”这类未经政策和实现确认的数字。"
      ]},
      "en-us":{question:"How long does AERTEX retain data?",short:"There is currently no single published retention policy that applies one duration to every AERTEX product.",answer:[
        "Different data types follow the lifecycle of their respective product implementations. AI conversations, files, documents, Watch events, and access-audit records do not necessarily share one retention period.",
        "Until a formal retention policy is published, AERTEX should not invent a universal number such as 'all data is kept for X days.'"
      ]}
    }
  },
  {
    id:"fd60774e-f413-4755-a5d6-83d354bf1052", category:"privacy", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"如何删除 AERTEX 中的数据？",short:"当前应在保存该数据的具体产品中使用对应的删除功能；还没有一个公开的“清空全部 AERTEX 数据”统一按钮。",answer:[
        "例如 Drive 文件、部分 Work 内容、项目任务和 Intelligence 会话拥有各自的删除操作；Watch 当前没有公开的“删除全部云端活动数据”接口。",
        "删除范围必须按产品分别确认，不能把某个产品的 DELETE 操作理解成整个账户的数据清除。"
      ]},
      "en-us":{question:"How can I delete data from AERTEX?",short:"Use the deletion controls of the product that stores the data; there is not currently one public button that erases every category of AERTEX data.",answer:[
        "For example, Drive files, some Work content, project/task data, and Intelligence conversations have their own deletion operations, while Watch currently has no public delete-all cloud activity endpoint.",
        "Deletion scope must be verified product by product rather than treating one product's DELETE operation as account-wide erasure."
      ]}
    }
  },
  {
    id:"0cddfd2b-7b23-4b76-a5da-a8436e861053", category:"privacy", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"删除 AERTEX 云端数据会影响本地副本吗？",short:"不能一概而论；是否影响本地副本取决于具体产品是否实现双向同步、本机桥接或独立本地存储。",answer:[
        "以 Watch 为例，当前甚至没有公开的“删除全部云端活动数据”接口，因此不能凭空承诺一次云端删除会怎样影响本地 ActivityWatch。",
        "Work 本机能力、浏览器缓存和用户手动导出的备份也具有不同语义。每个删除动作都应以对应产品当时的界面说明为准。"
      ]},
      "en-us":{question:"Does deleting AERTEX cloud data affect local copies?",short:"There is no universal rule; the effect on local copies depends on whether a specific product implements bidirectional sync, a local bridge, or separate local storage.",answer:[
        "For Watch, the current product does not even expose a public delete-all cloud activity operation, so AERTEX should not invent a promise about how such a deletion would affect local ActivityWatch data.",
        "Work local capabilities, browser caches, and user-exported backups also have different semantics. Each deletion action should be described by the relevant product UI."
      ]}
    }
  },
  {
    id:"4b735bc3-0d3d-4ee7-a75b-9f13f50c1054", category:"availability", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"中国大陆可以访问 AERTEX 吗？",short:"AERTEX 主站和主要 Web 产品按标准 HTTPS Web 服务提供，但实际可达性仍取决于当时网络环境和具体上游服务。",answer:[
        "AERTEX Watch 已为简体中文设置流程提供中国大陆下载路径，说明产品会针对大陆网络条件做适配。",
        "对于 Intelligence 等依赖外部 AI provider 的能力，不应把某一时刻的上游可用性概括成永久保证。"
      ]},
      "en-us":{question:"Can AERTEX be accessed from Mainland China?",short:"AERTEX's main site and core web products are delivered as standard HTTPS web services, but real-world reachability can still depend on the current network environment and specific upstream services.",answer:[
        "AERTEX Watch provides a Mainland China download path in its Simplified Chinese setup flow, reflecting product-specific network adaptation.",
        "For capabilities such as Intelligence that depend on external AI providers, temporary upstream availability should not be turned into a permanent guarantee."
      ]}
    }
  },
  {
    id:"65080ea0-9e2d-4092-90b4-bb1c966c1055", category:"availability", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"为什么 AERTEX Watch 的中国大陆教程不优先使用 GitHub 下载？",short:"主要是为了提高下载可达性和减少网络波动，而不是因为 ActivityWatch 不是开源项目。",answer:[
        "ActivityWatch 仍然是独立开源项目。AERTEX 只是为中国大陆的设置流程提供更容易访问的下载来源。",
        "AERTEX Watch Sync 本身则直接由第一方 aw.qsseda.com 提供，避免让普通用户在多个仓库和 Release 页面之间寻找文件。"
      ]},
      "en-us":{question:"Why doesn't the Mainland China AERTEX Watch guide prefer GitHub downloads?",short:"The main reason is download reachability and network reliability, not because ActivityWatch is not open source.",answer:[
        "ActivityWatch remains an independent open-source project. AERTEX simply provides a more reachable download source for the Mainland China setup flow.",
        "AERTEX Watch Sync itself is served directly from the first-party aw.qsseda.com domain so users do not need to search across repositories and Release pages."
      ]}
    }
  },
  {
    id:"72987c07-38ac-4982-9e40-1517e6cc1056", category:"availability", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 支持哪些浏览器？",short:"AERTEX 主要面向现代浏览器；当前代码识别并适配 Chrome、Edge、Firefox、Safari 等常见浏览器，但没有发布固定的最低版本支持矩阵。",answer:[
        "Web 功能依赖现代 JavaScript、Fetch、Web API 和安全 Cookie 等浏览器能力，因此过旧浏览器可能无法完整工作。",
        "需要特定能力的页面，例如本机桥接或二维码识别，还可能依赖额外浏览器 API；应以对应功能页面的实际检测结果为准。"
      ]},
      "en-us":{question:"Which browsers does AERTEX support?",short:"AERTEX targets modern browsers. The current code recognizes common browsers such as Chrome, Edge, Firefox, and Safari, but there is no published fixed minimum-version support matrix.",answer:[
        "Web features depend on modern JavaScript, Fetch, Web APIs, and secure-cookie behavior, so very old browsers may not work completely.",
        "Pages that need special capabilities, such as local bridging or QR decoding, can depend on additional browser APIs. Their own capability checks are the source of truth."
      ]}
    }
  },
  {
    id:"5d00c493-cd1a-4814-bce6-b0ab901a1057", category:"availability", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 支持哪些操作系统？",short:"大多数 AERTEX 产品通过浏览器使用，因此可在能运行现代浏览器的主流桌面和移动系统上访问；本机组件有各自的系统要求。",answer:[
        "Windows、macOS、Linux、iOS/iPadOS 和 Android 都可以作为 Web 访问环境，但这不代表每个平台都有 AERTEX 原生客户端。",
        "例如 Watch Sync 是电脑端脚本工具，而 Work 的本机桥接当前以 Windows 为主要完整目标。"
      ]},
      "en-us":{question:"Which operating systems does AERTEX support?",short:"Most AERTEX products are accessed through a browser and can therefore be used on major desktop and mobile systems with a modern browser; local components have their own platform requirements.",answer:[
        "Windows, macOS, Linux, iOS/iPadOS, and Android can all be web-access environments, but that does not mean AERTEX ships a native app for every platform.",
        "For example, Watch Sync is a computer-side script tool, while Work's local bridge currently treats Windows as the primary full desktop target."
      ]}
    }
  },
  {
    id:"cd3af9a6-4c58-41a9-b02c-a59cba721058", category:"availability", product:"AERTEX Watch", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX Watch Sync 当前支持哪些系统？",short:"Watch Sync 是 Node.js 脚本；官方设置教程当前重点覆盖 Windows + PowerShell 7，其他桌面系统取决于 Node.js 与 ActivityWatch 本机 API 环境。",answer:[
        "同步器本身使用 Node.js、HTTP 请求和本机状态文件，没有把代码硬编码成只能在 Windows 运行。",
        "但“理论可运行”和“已经有官方完整教程与验证”是两回事；当前公开指南应把 Windows 视为主要经过说明的路径。"
      ]},
      "en-us":{question:"Which systems does AERTEX Watch Sync currently support?",short:"Watch Sync is a Node.js script. The official setup guide currently focuses on Windows with PowerShell 7, while other desktop systems depend on Node.js and a reachable local ActivityWatch API.",answer:[
        "The sync code itself uses Node.js, HTTP requests, and a local state file and is not hard-coded to run only on Windows.",
        "However, theoretical portability is not the same as an officially documented and tested path. The current public guide treats Windows as the primary documented setup."
      ]}
    }
  },
  {
    id:"de271170-d34b-4515-ac4e-4363d0491059", category:"availability", product:"AERTEX", status:"published", updated:"2026-10-03",
    translations:{
      "zh-cn":{question:"AERTEX 的 Web 页面和本机组件分别负责什么？",short:"Web 页面负责账户、内容、查询和可视化；本机组件只在需要访问电脑本地能力时参与。",answer:[
        "例如 AERTEX Watch 网页负责账户、设备令牌、状态和活动数据查看，而 Watch Sync 在电脑上连接 127.0.0.1:5600 并上传 ActivityWatch 事件。",
        "AERTEX Work 的本机桥接用于需要本地 TeX 或其他电脑能力的场景。把这些本机组件统称为完整的 AERTEX 原生客户端并不准确。"
      ]},
      "en-us":{question:"What do AERTEX web pages and local components each do?",short:"Web pages handle accounts, content, queries, and visualization; local components participate only when a feature needs capabilities on the user's computer.",answer:[
        "For example, the AERTEX Watch web interface handles the account, device tokens, status, and activity viewing, while Watch Sync connects to 127.0.0.1:5600 on the computer and uploads ActivityWatch events.",
        "AERTEX Work's local bridge is used when local TeX or other computer capabilities are required. These components should not automatically be described as full native AERTEX clients."
      ]}
    }
  }

]);

export function publishedQuestions() {
  return QUESTIONS.filter(item => item.status === "published");
}

export function publishedQuestionIds() {
  return publishedQuestions().map(item => item.id);
}

export function questionById(id) {
  return QUESTIONS.find(item => item.id === String(id || "").toLowerCase()) || null;
}

export function questionRouteLocale(locale) {
  const code = String(locale || "").toLowerCase();
  if (code === "zh-cn" || code === "zh-tw") return "zh-cn";
  return "en-us";
}

export function questionContentLocale(locale) {
  return questionRouteLocale(locale) === "zh-cn" ? "zh-cn" : "en-us";
}

export function questionTranslation(item, locale) {
  if (!item) return null;
  return item.translations?.[questionContentLocale(locale)] || null;
}
