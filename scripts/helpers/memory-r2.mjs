import { createHash } from "node:crypto";

// Behavioral double, including atomic conditional writes. Hooks execute BEFORE
// the precondition is tested, making a concurrent write reproducible in tests.
export class MemoryR2 {
  constructor() { this.records = new Map(); this.writes = []; this.beforePut = null; }
  seed(key, value, metadata = {}) {
    const body = typeof value === "string" ? value : JSON.stringify(value);
    const etag = createHash("sha256").update(body).digest("hex");
    this.records.set(key, { body, etag, customMetadata: { ...metadata }, uploaded: new Date() });
    return etag;
  }
  async put(key, body, options = {}) {
    if (this.beforePut) await this.beforePut(key, body, options);
    const current = this.records.get(key);
    if (options.onlyIf?.etagMatches && current?.etag !== options.onlyIf.etagMatches) return null;
    if (options.onlyIf?.etagDoesNotMatch === "*" && current) return null;
    const etag = this.seed(key, body, options.customMetadata);
    this.writes.push({ key, body, options });
    return { key, etag };
  }
  async get(key) {
    const record = this.records.get(key);
    if (!record) return null;
    const { body, etag, customMetadata, uploaded } = record;
    return { key, etag, customMetadata: { ...customMetadata }, uploaded,
      text: async () => body, json: async () => JSON.parse(body) };
  }
  async head(key) { const value = await this.get(key); return value ? { ...value } : null; }
  async delete(keys) { for (const key of Array.isArray(keys) ? keys : [keys]) this.records.delete(key); }
  async list({ prefix = "", limit = 1000, cursor = "" } = {}) {
    const entries = [...this.records].filter(([key]) => key.startsWith(prefix)).sort(([a], [b]) => a.localeCompare(b));
    const remaining = entries.filter(([key])=>!cursor || key>cursor);
    const objects = remaining.slice(0, limit).map(([key, value]) => ({ key, ...value }));
    return { objects, truncated: remaining.length>limit, cursor: objects.at(-1)?.key };
  }
  document(key) { const record = this.records.get(key); return record ? JSON.parse(record.body) : null; }
}
