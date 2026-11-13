// Historical multi-file uploads could leave a visible main.tex in "files"
// while the canonical entry remained tombstoned (main_deleted=true). Treat
// the explicitly stored root main.tex as the entry; never resurrect erased
// source or invent a file when no stored entry exists.
//
// Pure/lossless: the actual saved file bytes are transferred to "source",
// all unrelated files remain unchanged, and a deliberate deletion with no
// main.tex remains deleted. Normalization does not itself write to storage.
export function reconcileTexMainEntry(document) {
  if (!document || document.main_deleted !== true || !Array.isArray(document.files)) {
    return document;
  }
  const candidates = document.files.filter(file =>
    file && typeof file.name === "string" &&
    /^main\.tex$/i.test(file.name) && file.encoding === "utf8" &&
    typeof file.content === "string" && file.content.length <= 180000
  );
  if (candidates.length !== 1) return document;
  const entry = candidates[0];
  return {
    ...document,
    main_deleted: false,
    main_filename: entry.name,
    source: entry.content,
    files: document.files.filter(file => file !== entry)
  };
}
