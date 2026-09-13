export function workspaceContent(path, zh, statusContent) {
  if (path.endsWith("/workbench")) return statusContent(zh, "工作台数据尚未接入", "工作台是工作区中的主要操作界面；当前尚未建立独立的持久化工作台数据模型。", "Workbench data is not connected yet", "The Workbench is the primary operating surface inside Workspace; a dedicated persistent workbench data model has not been established yet.");
  if (path.endsWith("/projects")) return statusContent(zh, "项目数据尚未接入", "当前数据库没有 projects 表，因此不展示项目名称、状态或完成百分比。", "Project data is not connected yet", "There is no projects table in the current database, so project names, statuses, and completion percentages are not shown.");
  if (path.endsWith("/experiments")) return statusContent(zh, "实验工具尚未接入", "Prompt、Agent 和 API 实验目前没有持久化数据或独立工具接口。", "Experiment tools are not connected yet", "Prompt, agent, and API experiments do not currently have persistent data or dedicated tool APIs.");
  if (path.endsWith("/drafts")) return statusContent(zh, "草稿存储尚未接入", "当前数据库没有 drafts 表或草稿保存接口。", "Draft storage is not connected yet", "There is no drafts table or draft persistence API yet.");
  if (path.endsWith("/tasks")) return statusContent(zh, "任务数据尚未接入", "当前数据库没有 tasks 表，因此不展示 Todo 或 Kanban 数据。", "Task data is not connected yet", "There is no tasks table in the current database, so Todo or Kanban data is not shown.");
  return statusContent(zh, "工作区数据尚未接入", "项目、实验、草稿和任务目前没有统一的持久化工作区数据模型。", "Workspace data is not connected yet", "Projects, experiments, drafts, and tasks do not yet have a unified persistent workspace data model.");
}
