// Select only inert, compilation-relevant assets from a Work project.
// Other supported formats (Office, application source code, GitHub workflows)
// remain in the user's Work project and are never uploaded to the managed
// GitHub compilation repository. Never let project files replace the workflow.
import {
  MAX_PROJECT_EXTRA_FILES, MAX_PROJECT_BYTES, MAX_SINGLE_FILE_BYTES,
  isSafeProjectFilename, isBinaryProjectFile
} from "./tex-project-file-types.js";

const textEncoder = new TextEncoder();
const COMPILATION_ASSET = /\.(?:tex|bib|sty|cls|bst|bbx|cbx|def|dtx|ins|ltx|tikz|pgf|csv|tsv|txt|dat|png|jpe?g|pdf|eps|ttf|otf)$/i;
const MAX_COMPILATION_FILES = MAX_PROJECT_EXTRA_FILES;

export function selectTexGithubCompileFiles(doc) {
  const extras = Array.isArray(doc?.files) ? doc.files : [];
  if (extras.length > MAX_COMPILATION_FILES) {
    throw new Error("This project contains more than 500 files, including main.tex.");
  }
  const source = doc?.source;
  if (typeof source !== "string" || !source.trim()) {
    throw new Error("Save your XeLaTeX source before compiling.");
  }
  const entries = [{name:"main.tex",encoding:"utf8",content:source}];
  let totalBytes=textEncoder.encode(source).length;
  let skipped=0;
  const seen=new Set(["main.tex"]);
  for (const asset of extras) {
    const name=String(asset?.name ?? "");
    // Validate before deciding whether to omit an asset. Storage may contain
    // legacy/untrusted records, so unsafe paths cannot be ignored silently.
    if (!isSafeProjectFilename(name) || name.toLowerCase()==="main.tex") {
      throw new Error("Invalid project file path: " + name.slice(0,100));
    }
    const key=name.toLowerCase();
    if (seen.has(key)) throw new Error("Duplicate project filename: " + name.slice(0,100));
    seen.add(key);
    const segments=name.split("/");
    // Do not mirror any user-supplied .github/*, dotfiles, generated main.pdf,
    // or arbitrary source code into the privileged managed workflow repository.
    const canCompile=COMPILATION_ASSET.test(name) &&
      !segments.some(part=>part.startsWith(".")) &&
      key!=="main.pdf";
    if(!canCompile){skipped++;continue;}
    const binary=isBinaryProjectFile(name);
    const expected=binary?"base64":"utf8";
    if(asset?.encoding!==expected || typeof asset.content!=="string") {
      throw new Error("Invalid encoding for compilation asset: " + name.slice(0,100));
    }
    let length;
    if(binary) {
      const encoded=asset.content;
      if(encoded.length>Math.ceil(MAX_SINGLE_FILE_BYTES*4/3)+4 ||
         !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) {
        throw new Error("Invalid binary compilation asset: " + name.slice(0,100));
      }
      length=(encoded.length/4)*3-(encoded.endsWith("==")?2:encoded.endsWith("=")?1:0);
    }else length=textEncoder.encode(asset.content).length;
    if(length>MAX_SINGLE_FILE_BYTES) {
      throw new Error("Compilation asset exceeds 8 MiB: " + name.slice(0,100));
    }
    totalBytes+=length;
    if(totalBytes>MAX_PROJECT_BYTES) {
      throw new Error("Compilation assets exceed the 32 MiB project limit.");
    }
    entries.push({name,encoding:expected,content:asset.content});
  }
  return {entries,skipped,included:entries.length,totalBytes};
}
