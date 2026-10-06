// 初学者导读：Studio 通用 Workspace 页面：把项目、草稿、任务等个人工作对象组织成统一入口。
import { osHubGrid } from "./ui-primitives.js";

const WORKSPACE_COPY = {
  "zh-cn": {
    eyebrow:"工作区", title:"工作区", intro:"把项目、任务、草稿、工具与日常工作集中在同一个入口。这里不创建重复数据，只连接各模块的真实状态。",
    modules:"5", modulesLabel:"工作模块", data:"实时", dataLabel:"模块状态",
    workbench:["工作台","总览","汇总进行中的项目、今天与逾期任务、最近草稿和研究笔记。"],
    projects:["项目管理","项目","维护项目状态、优先级、链接和下一步行动。"],
    experiments:["实验室","工具","进入 TeX、媒体处理与工程工具，并查看各工具可用状态。"],
    drafts:["草稿箱","草稿","记录未定稿内容，自动保存，并可关联到具体项目。"],
    tasks:["任务中心","任务","管理待办、进行中、优先级、截止时间和项目关联。"]
  },
  "zh-tw": {
    eyebrow:"工作區", title:"工作區", intro:"把專案、任務、草稿、工具與日常工作集中在同一個入口。這裡不建立重複資料，只連接各模組的真實狀態。",
    modules:"5", modulesLabel:"工作模組", data:"即時", dataLabel:"模組狀態",
    workbench:["工作台","總覽","彙整進行中的專案、今天與逾期任務、最近草稿和研究筆記。"],
    projects:["專案管理","專案","維護專案狀態、優先級、連結與下一步行動。"],
    experiments:["實驗室","工具","進入 TeX、媒體處理與工程工具，並查看各工具可用狀態。"],
    drafts:["草稿箱","草稿","記錄尚未定稿的內容，自動儲存，並可關聯到具體專案。"],
    tasks:["任務中心","任務","管理待辦、進行中、優先級、截止時間和專案關聯。"]
  }
};
const EN = {
  eyebrow:"Workspace", title:"Workspace", intro:"Bring projects, tasks, drafts, tools, and everyday work into one entry point. Workspace does not duplicate data; it connects the live state of each module.",
  modules:"5", modulesLabel:"work modules", data:"Live", dataLabel:"module state",
  workbench:["Workbench","Overview","See active projects, today and overdue tasks, recent drafts, and research notes together."],
  projects:["Project Management","Projects","Maintain project status, priority, links, and the next concrete action."],
  experiments:["Lab","Tools","Open TeX, media, and engineering tools and see which capabilities are available."],
  drafts:["Drafts","Drafts","Capture unfinished work with autosave and optional project links."],
  tasks:["Task Center","Tasks","Manage todo, in-progress, priority, due dates, and project relationships."]
};

export function workspaceContent(path, zh, locale = "") {
  const c = WORKSPACE_COPY[locale] || (zh ? WORKSPACE_COPY["zh-cn"] : EN);
  const prefix = "/" + (locale || (zh ? "zh-cn" : "en-us"));
  const items = [
    {key:"workbench",icon:"workbench",href:prefix+"/workspace/workbench",featured:true},
    {key:"projects",icon:"projects",href:prefix+"/workspace/projects"},
    {key:"experiments",icon:"experiments",href:prefix+"/workspace/experiments"},
    {key:"drafts",icon:"drafts",href:prefix+"/workspace/drafts"},
    {key:"tasks",icon:"tasks",href:prefix+"/workspace/tasks"}
  ].map(item => ({
    href:item.href,
    icon:item.icon,
    featured:item.featured,
    title:c[item.key][0],
    meta:c[item.key][1],
    description:c[item.key][2]
  }));

  return `
    <section class="workspace-hub" data-workspace-hub>
      <div class="workspace-hub-hero">
        <div class="workspace-hub-hero-copy">
          <span>${c.eyebrow}</span>
          <h2>${c.title}</h2>
          <p>${c.intro}</p>
        </div>
        <div class="workspace-hub-summary" aria-label="${c.title}">
          <div><strong>${c.modules}</strong><span>${c.modulesLabel}</span></div>
          <div><strong>${c.data}</strong><span>${c.dataLabel}</span></div>
        </div>
      </div>
      ${osHubGrid(items,"workspace-hub-grid")}
    </section>`;
}
