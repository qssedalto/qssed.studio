import { statusContent } from "./ui-primitives.js";

export function workspaceContent(path, zh) {
  if (path.endsWith("/workbench")) return statusContent(zh, "工作台尚未开放", "工作台数据模型还没接入。", "Workbench isn’t available yet", "Workbench data is not connected yet.");
  if (path.endsWith("/projects")) return statusContent(zh, "项目尚未开放", "项目数据表还没接入。", "Projects aren’t available yet", "Project data is not connected yet.");
  if (path.endsWith("/experiments")) return statusContent(zh, "实验室尚未开放", "实验数据和工具接口还没接入。", "Lab isn’t available yet", "Experiment data and tool APIs are not connected yet.");
  if (path.endsWith("/drafts")) return statusContent(zh, "草稿尚未开放", "草稿保存接口还没接入。", "Drafts aren’t available yet", "Draft storage is not connected yet.");
  if (path.endsWith("/tasks")) return statusContent(zh, "任务尚未开放", "任务数据表还没接入。", "Tasks aren’t available yet", "Task data is not connected yet.");
  return statusContent(zh, "工作区尚未开放", "项目、实验、草稿和任务的数据模型还没接入。", "Workspace isn’t available yet", "Projects, experiments, drafts, and tasks are not connected yet.");
}
