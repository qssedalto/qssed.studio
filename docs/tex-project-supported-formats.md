# AERTEX Work 项目文件格式与上传限制

此文档与 `studio/tex-project-file-types.js` 的统一文件类型目录保持一致。项目文件作为用户私有数据存储，上传不会自动执行源代码、宏或二进制程序。

## 数量和大小

- 每个项目最多 **500 个文件**（`main.tex` 占用一个名额，附加文件最多 499 个）。
- 单个文件最大 **8 MiB**；每个项目解码后的全部文件内容累计最大 **32 MiB**。
- ZIP 项目导入最大 **24 MiB**；ZIP 中最多容纳 3,000 个目录/文件记录以处理包含 macOS 元数据的归档，但实际导入项目的文件仍不得超过 500 个。
- 项目内上传采用小批次处理，不必逐个手工上传 500 个文件。文件名最多 240 个字符、最多 20 级路径。
- `main.tex` 是现有 TeX 工作台必需的编译入口；支持 Word、Excel 等文件，不等于可以使用 XeLaTeX 直接编译这些格式。

## 支持的类别

| 文件类别 | 常见扩展名或文件名 | 存储形式 |
| --- | --- | --- |
| LaTeX | `.tex`, `.bib`, `.sty`, `.cls`, `.bst`, `.bbx`, `.cbx`, `.dtx`, `.tikz` | UTF-8 文本 |
| Word / 文档 | `.doc`, `.docx`, `.docm`, `.rtf`, `.odt`, `.pages`, `.pdf`, `.epub` | Office/PDF 二进制；RTF 文本 |
| Excel / 数据表 | `.xls`, `.xlsx`, `.xlsm`, `.xlsb`, `.ods`, `.numbers`, `.csv`, `.tsv` | 工作簿二进制；CSV/TSV 文本 |
| PowerPoint / 演示 | `.ppt`, `.pptx`, `.pptm`, `.odp`, `.key` | 二进制 |
| Markdown / 配置 | `.md`, `.markdown`, `.rst`, `.json`, `.jsonl`, `.json5`, `.yaml`, `.yml`, `.toml`, `.ini`, `.xml`, `.properties` | UTF-8 文本 |
| 网页前端 | `.html`, `.htm`, `.css`, `.scss`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.vue`, `.svelte`, `.astro` | UTF-8 文本 |
| C/C++ | `.c`, `.h`, `.cc`, `.cpp`, `.cxx`, `.hpp`, `.hxx`, `.c++` | UTF-8 文本 |
| Java / JVM | `.java`, `.kt`, `.kts`, `.scala`, `.groovy`, `.gradle`, `.class`, `.jar` | 源文件为 UTF-8；class/JAR 为二进制 |
| 其他编程语言 | `.py`, `.pyi`, `.ipynb`, `.go`, `.rs`, `.rb`, `.php`, `.swift`, `.dart`, `.lua`, `.r`, `.jl`, `.cs`, `.fs`, `.vb`, `.sql`, `.sh`, `.bat`, `.ps1`, `.f90` | 源代码为 UTF-8 |
| Git / 工程配置 | `.gitignore`, `.gitattributes`, `.gitmodules`, `.editorconfig`, `.dockerignore`, `.github/workflows/*.yml`, `Dockerfile`, `Makefile`, `README`, `LICENSE` | UTF-8 文本 |
| 图片与矢量 | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.bmp`, `.svg`, `.tif`, `.avif`, `.psd` | 二进制（SVG 按 UTF-8 文本保存） |
| 资源与附件 | `.zip`, `.tar`, `.gz`, `.7z`, `.rar`, `.mp3`, `.wav`, `.mp4`, `.webm`, `.ttf`, `.otf`, `.woff2`, `.sqlite`, `.parquet` | 二进制 |

完整清单以代码目录中的扩展名数组为准。支持格式指**允许上传、保留目录、下载及项目打包**：并不保证 Word、Excel、PowerPoint 或所有图片/媒体均可在网页内直接编辑或预览。PDF 和部分图片可在源码编辑区预览；Markdown、CSV、源代码等按文本处理。

## 安全与归档

- ZIP 解包拒绝路径穿越、符号链接、加密 ZIP 和不支持的压缩算法；保留针对解压大小及单文件大小的限制，避免 ZIP 炸弹。
- 导入 `Machine-Learning-main.zip` 时，`.gitignore`、`.github/workflows/latex.yml` 是受支持的普通文件；`__MACOSX`、`._*`、`.DS_Store` 等系统元数据则自动排除。
- 上传 JavaScript、Python、Java、C/C++ 等代码文件只是保存源代码，不会在服务器或浏览器自动运行这些文件。请勿上传 `.env` 等包含真实密钥的私密凭据文件。
- 某些 Windows 旧版 CSV 使用 GBK 编码；当前文本上传要求 UTF-8，请在 Excel 导出时选择 UTF-8 CSV。
