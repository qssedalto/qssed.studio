import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { enhanceWorkTexUiPolish } from '../studio/ui-work-tex-ui-polish.js';
import { enhanceWorkTexCompileToolbar } from '../studio/ui-work-tex-compile-toolbar.js';

const html = '<!doctype html><html lang="zh-cn" data-theme="dark"><head><title>Work</title></head>'+
'<body class="os-shell"><div class="tex-work-app" data-tex-root><div class="tex-editor-commandbar"></div>'+
'<div id="tex-editor"><div class="tex-editor-toolbar"><button id="tex-code-theme-toggle">代码配色</button></div></div>'+
'<div id="tex-document-list"></div></div></body></html>';
const output = enhanceWorkTexUiPolish(html,true);
const english = enhanceWorkTexUiPolish(html,false);
assert(output.includes('id="aertex-tex-ui-polish"'));
assert(output.includes('id="aertex-tex-ui-polish-runtime"'));
assert.equal(output.match(/tex-palette-glyph-dark/g).length > 0, true);
assert(output.includes('viewBox="30 14 65 65"') && output.includes('viewBox="25.5 38.5 64 64"'));
assert(output.includes('aertex-project-grid-icon') && output.includes('aertex-project-book-icon'));
assert(output.includes('tex-word-wrap-toggle') && output.includes('aertex:tex-word-wrap'));
assert(output.includes('grid-column:1!important;grid-row:2!important'));
assert(output.includes('input[type="radio"]') && output.includes('appearance:radio!important'));
assert(output.includes('aertex-pdf-page') && output.includes('background:#202126!important'));
assert(output.includes('aria-pressed'));
assert(english.includes('Disable word wrap'));
const run=output.match(/<script id="aertex-tex-ui-polish-runtime">([\s\S]*?)<\/script>/)?.[1];
assert(run,'Missing inline runtime');
new vm.Script(run,'AERTEX UI runtime syntax');
const build=enhanceWorkTexCompileToolbar('<body></body>',true);
assert(build.includes('titleRow.append(indicator,titleStack,logButton)'));
const code=fs.readFileSync(new URL('../studio/ui-work-tex-codemirror.js', import.meta.url),'utf8');
assert(code.includes('wordWrapCompartment.reconfigure') && code.includes('wordWrapCompartment.of'));
assert(code.includes("wrapEnabled ? EditorView.lineWrapping : []"));
const collaboration=fs.readFileSync(new URL('../studio/ui-work-tex-collaboration.js', import.meta.url),'utf8');
assert(!collaboration.includes("'<div class=\"tex-collaboration-state\""));
const filechat=fs.readFileSync(new URL('../studio/ui-work-tex-file-chat.js', import.meta.url),'utf8');
assert(!filechat.includes('🔒 已验证 · 3 小时'));
const preview=fs.readFileSync(new URL('../studio/ui-tex-local.js', import.meta.url),'utf8');
assert(preview.includes('完成时间：') && preview.includes('耗时：') && preview.includes('toFixed(2)'));
assert(preview.includes('编译服务正常') && preview.includes('暂时无法编译，请检查设备连接'));
console.log('Work TeX visual, SVG, wrap, modal, status and PDF polish contracts passed.');
