# AERTEX TeX 自托管前端依赖

本目录在 GitHub Actions 内以固定的直接依赖版本构建 CodeMirror 6、TeX 语法模式与 Yjs，并将它们打包为两个不依赖外部 ESM CDN 的前端模块：

- `/assets/tex/codemirror.js`
- `/assets/tex/yjs.js`

**用户访问 Work 时，浏览器只从 `work.qsseda.com` 请求这两个模块；不会向 jsDelivr 或 esm.sh 请求 CodeMirror/Yjs。**

## 构建

```sh
npm install --prefix tex-vendor --no-audit --no-fund
node tex-vendor/build.mjs
```

生产/PR 流水线会执行上述操作，使用 Wrangler Static Assets 随 Work Worker 同步部署。请勿直接使用 CDN ESM 构建片段替代本项目自托管 bundle。

## 依赖与许可

依赖版本固定在 `package.json`，npm 会在构建时解析传递依赖。CodeMirror 相关模块为 MIT，Yjs 为 MIT，esbuild 为 MIT。构建保留法律声明，原始上游许可依每个 npm 包的 LICENSE 文件为准。后续可以提交 npm lockfile，提升传递依赖构建的可复现性。

仅改变前端资源来源；账号鉴权、文档成员权限及后端协作房间逻辑不改变。
