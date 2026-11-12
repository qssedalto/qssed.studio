// Canonical Work project file types and storage budgets.
// Shared by ZIP import, authenticated per-file API, and browser UI.
// Files are stored as inert data; uploading Office/code does NOT execute it.
export const MAX_PROJECT_FILES = 500; // includes required main.tex
export const MAX_PROJECT_EXTRA_FILES = MAX_PROJECT_FILES - 1;
export const MAX_ARCHIVE_ENTRIES = 3000; // includes directory and macOS metadata entries
export const MAX_PROJECT_BYTES = 32 * 1024 * 1024; // decoded content, all files
export const MAX_SINGLE_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_ZIP_BYTES = 24 * 1024 * 1024;
export const MAX_JSON_UPLOAD_BYTES = 48 * 1024 * 1024;
export const MAX_TEXT_CHARACTERS = 2_000_000;
export const MAX_PROJECT_FILENAME_CHARS = 240;
export const MAX_PROJECT_PATH_SEGMENTS = 20;

export const TEXT_EXTENSIONS = Object.freeze([
  "tex","bib","sty","cls","bst","bbx","cbx","def","dtx","ins","ltx","tikz","pgf","rnw",
  "txt","md","markdown","rst","adoc","org","csv","tsv","log","rtf","texi",
  "c","h","cc","cpp","cxx","hpp","hxx","c++","h++","java","js","jsx","mjs","cjs",
  "ts","tsx","mts","cts","json","jsonl","json5","yaml","yml","toml","ini","cfg",
  "conf","config","properties","xml","xsd","xsl","html","htm","css","scss","sass","less",
  "py","pyi","ipynb","sql","sh","bash","zsh","fish","bat","cmd","ps1","psm1","psd1",
  "cs","fs","fsx","vb","go","rs","rb","php","swift","kt","kts","dart","lua","r",
  "rmd","jl","scala","sc","groovy","gradle","vue","svelte","astro","elm",
  "ex","exs","erl","hrl","hs","lhs","ml","mli","clj","cljs","cljc","edn","zig",
  "nim","v","sv","vhd","vhdl","asm","s","f","f90","f95","for","m","mm","pl",
  "pm","tcl","awk","sed","proto","graphql","gql","tf","tfvars","hcl","nix",
  "make","mk","cmake","lock","patch","diff","svg","manifest","mod","sum",
  "texinfo"
]);
export const BINARY_EXTENSIONS = Object.freeze([
  // Office and common office-document interchange formats.
  "doc","docx","docm","dot","dotx","xls","xlsx","xlsm","xlsb","ppt","pptx","pptm",
  "potx","odt","ods","odp","pdf","epub","pages","numbers","key",
  // Pictures, graphics, archives, fonts, audio/video, and useful binary assets.
  "png","jpg","jpeg","gif","webp","bmp","ico","tif","tiff","avif","heic","heif",
  "apng","psd","ai","eps",
  "zip","tar","gz","tgz","bz2","xz","7z","rar","jar","war","ear",
  "mp3","wav","ogg","flac","aac","m4a","mp4","mov","webm","avi","mkv",
  "ttf","otf","woff","woff2","eot","class","wasm","sqlite","sqlite3","db",
  "parquet","arrow","feather"
]);
export const SAFE_DOTFILES = Object.freeze([
  ".gitignore",".gitattributes",".gitmodules",".editorconfig",".dockerignore",
  ".prettierrc",".clang-format",".eslintrc",".babelrc",".npmignore",".browserslistrc"
]);
export const SAFE_DOT_DIRECTORIES = Object.freeze([".github",".vscode",".devcontainer"]);
export const SAFE_EXTENSIONLESS_FILES = Object.freeze([
  "readme","license","licence","notice","changelog","contributing","authors",
  "dockerfile","makefile","gnumakefile","cmakelists.txt","gemfile","procfile",
  "rakefile","build","workspace","jenkinsfile"
]);
const textSet = new Set(TEXT_EXTENSIONS);
const binarySet = new Set(BINARY_EXTENSIONS);
const dotSet = new Set(SAFE_DOTFILES);
const dotDirSet = new Set(SAFE_DOT_DIRECTORIES);
const extensionlessSet = new Set(SAFE_EXTENSIONLESS_FILES);

export const PROJECT_ACCEPT = [...new Set([
  ...[...TEXT_EXTENSIONS,...BINARY_EXTENSIONS].map(extension=>"."+extension),
  ...SAFE_DOTFILES
])].join(",");

export function projectFileExtension(name) {
  const base=String(name||"").split("/").at(-1)||"";
  const dot=base.lastIndexOf(".");
  return dot>0?base.slice(dot+1).toLowerCase():"";
}
export function isBinaryProjectFile(name) {
  return binarySet.has(projectFileExtension(name));
}
export function isTextProjectFile(name) {
  const base=String(name||"").split("/").at(-1)||"";
  return textSet.has(projectFileExtension(name)) || dotSet.has(base.toLowerCase()) ||
    extensionlessSet.has(base.toLowerCase());
}
export function isSupportedProjectFile(name) {
  return isTextProjectFile(name)||isBinaryProjectFile(name);
}
export function isSafeProjectFilename(name) {
  if(typeof name!=="string" || !name || name.length>MAX_PROJECT_FILENAME_CHARS ||
      name.startsWith("/")||name.includes("\\")||/[\x00-\x1f\x7f]/.test(name)) return false;
  const parts=name.split("/");
  if(parts.length>MAX_PROJECT_PATH_SEGMENTS || parts.some(part=>
      !part||part.length>100||part==="."||part===".."))return false;
  for(let i=0;i<parts.length-1;i++){
    if(parts[i].startsWith(".")&&!dotDirSet.has(parts[i].toLowerCase()))return false;
  }
  return isSupportedProjectFile(name);
}
export function isSkippableArchiveMetadata(name) {
  const parts=String(name||"").split("/");
  const base=parts.at(-1)||"";
  return parts.some(part=>part==="__MACOSX"||part===".git"||part===".svn")||
    base.startsWith("._") || base===".DS_Store"||base==="Thumbs.db"||base==="desktop.ini";
}
