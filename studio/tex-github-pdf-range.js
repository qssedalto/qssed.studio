// RFC 7233 single-byte-range support for authenticated inline PDF delivery.
// Safari PDFKit may request nonzero ranges rather than downloading the whole PDF.
export function selectTexPdfRange(bytes, rangeHeader) {
  const total = bytes.byteLength;
  if (!rangeHeader) return {status:200, body:bytes, contentRange:null};
  const fail = () => ({status:416,body:null,contentRange:"bytes */"+total});
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(rangeHeader).trim());
  if (!match || (!match[1] && !match[2])) return fail();
  let start, end;
  if (!match[1]) {
    const suffix=Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix<=0) return fail();
    start=Math.max(0,total-suffix);end=total-1;
  } else {
    start=Number(match[1]);
    if (!Number.isSafeInteger(start) || start>=total) return fail();
    end=match[2]?Math.min(total-1,Number(match[2])):total-1;
    if (!Number.isSafeInteger(end) || end<start) return fail();
  }
  return {status:206,body:bytes.subarray(start,end+1),contentRange:
    "bytes "+start+"-"+end+"/"+total};
}
