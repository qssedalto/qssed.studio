// 初学者导读：HTML 转义与小型生成辅助函数；所有把用户输入插入 SSR HTML 的模块都应优先复用这里的安全转义。
export function escapeHtmlText(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}
